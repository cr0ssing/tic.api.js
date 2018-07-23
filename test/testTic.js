const winston = require('winston');

// Override to use real console.log etc for VSCode debugger
winston.transports.Console.prototype.log = function (info, callback) {
    const out = `{ message: '${info.message}',\n  level: '${info.level}'\n  timestamp: '${info.timestamp}'}`
    console[info.level in console ? info.level : 'log'](out);
    if (callback) {
        callback()
    }
};

const expect = require('chai').expect
const rewire = require("rewire")
const mock = require("mam.tools.js/test/mamMock")
let mamClient = rewire("mam.tools.js")
let tic = rewire("../lib/ticApi")
//replace original mam lib with mock
if (!process.env.UNMOCK) {
    mamClient.__set__("Mam", mock)
    tic.__set__("mamClient", mamClient)
}

if (process.env.PROVIDER) {
    tic.setProvider(process.env.PROVIDER)
}

describe("testing TIC api", () => {
    it("should create tic correcly", async () => {
        const ticClient = await tic.create.from()
        const masterSeed = ticClient.masterClient.mam.seed
        const password = ticClient.password
        console.log("Created seed:", masterSeed)
        console.log("Password:", password)
        const roots = Object.keys(ticClient.channelClients).map(c => ticClient.channelClients[c].channelRoot)
        const seeds = Object.keys(ticClient.channelClients).map(c => ticClient.channelClients[c].mam.seed)

        let { mam: client, channelRoot } = await mamClient.createMam(masterSeed)
        console.log("Public channel root:", channelRoot)
        expect(channelRoot).to.equal(ticClient.masterClient.channelRoot)

        let messages = await mamClient.getChannelMessages(channelRoot, client)
        console.log("Roots:", messages.messages)
        expect(messages.messages).to.deep.equal(roots)

        const resp = await mamClient.changeMode(client, 'restricted', password)
        client = resp.mam
        channelRoot = resp.channelRoot
        messages = await mamClient.getChannelMessages(channelRoot, client)
        console.log("Seeds:", messages.messages)
        expect(messages.messages).to.deep.equal(seeds)

        const state = await tic.init.fromMasterSeed({masterSeed, password})
        console.log("Master-seed:", state.masterClient.mam.seed)
        expect(state.masterClient.mam.seed).to.equal(masterSeed)
        Object.keys(state.channelClients)
            .forEach(client => {
                const { mam, channelRoot } = state.channelClients[client]
                console.log(client + "-seed: " + mam.seed + "\n" + client + "-root: " + channelRoot)
                expect(mam.seed).to.equal(ticClient.channelClients[client].mam.seed)
                expect(channelRoot).to.equal(ticClient.channelClients[client].channelRoot)
            })
    })

    const create = async (amount, saveSeeds) => {
        const result = []
        for (var i = 0; i < amount; i++) {
            console.log(`Creating tic account ${i}...`)
            result[i] = saveSeeds ? await tic.create.from() : await tic.create.from({password: null})
        }
        return result
    };

    const testTic = async (saveSeeds) => {
        const tics = await create(5, saveSeeds)
        console.log("Seeds:")
        tics.forEach((t, i) => console.log(`${i}: ${t.masterClient.mam.seed}`))
        
        console.log("Publishing trustings for all created tic accounts...")
        await tic.contacts.trust(tics[0].contacts, [tics[1].masterRoot, tics[2].masterRoot])
        await tic.contacts.trust(tics[2].contacts, [tics[3].masterRoot])
        await tic.contacts.distrust(tics[3].contacts, [tics[4].masterRoot])
        await tic.contacts.trust(tics[2].contacts, [tics[0].masterRoot, tics[1].masterRoot])

        console.log("Computing rating from contacts on tangle...")
        const result = await tic.rating.fromTIC(tics[0], tics[4].masterRoot)

        tics.forEach((t, i) => console.log(`${i}: ${t.masterRoot}`))
        console.log("Tree:")
        printTree(result.graph, r => `${r.masterRoot}: ${r.rating} ${r.depth}`)
        console.log("Contacts:")
        result.visited.forEach(c => console.log(`${c.masterRoot}: ${c.depth}`))
        console.log("Ratings:", result.rating.flat)
        console.log("Weighted:", result.rating.weighted)
        console.log("Per Level:")
        result.rating.perLevel.forEach((l, i) => console.log(`${i}:`, l))

        expect(result.rating.flat).to.deep.equal({
            trust: 0,
            distrust: 1,
            unknown: 3
        })
        expect(result.rating.weighted).to.deep.equal({
            trust: 0,
            distrust: 1/3,
            unknown: 2
        })
        expect(result.rating.perLevel).to.have.deep.members([
            {trust: 0, distrust: 0, unknown: 1},
            {trust: 0, distrust: 0, unknown: 2},
            {trust: 0, distrust: 1, unknown: 0}
        ])
    }

    const printTree = (r, format, depth = 0, visited = []) => {
        let s = ""
        for (i = 0; i < depth; i++) {
            s += "  "
        }
        console.log(s + format(r))

        if (visited.indexOf(r) == -1) {
            visited.push(r)
            r.contacts.forEach(c => {
                printTree(c, format, depth + 1, visited)
            })
        }
    }

    it("should compute the score derived from multiple single seed TIC profiles", async () => {
        await testTic(true)
    })

    it("should compute the score derived from multiple TIC profiles without saved seeds", async () => {
        await testTic(false)
    })
});