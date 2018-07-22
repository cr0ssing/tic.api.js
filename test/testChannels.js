const expect = require('chai').expect
const rewire = require("rewire")
const mock = require("mam.tools.js/test/mamMock")
const mamClient = rewire("mam.tools.js/lib/mamClient")
const tic = rewire("../lib/ticApi")
//replace original mam lib with mock
if (!process.env.UNMOCK) {
    mamClient.__set__("Mam", mock)
    tic.__set__("mamClient", mamClient)
}

describe("testing channels", () => {
    describe("testing profile with random mamClient", () => {
        it("Read empty channel", async () => {
            const client = await mamClient.createMam()
            await assertProfile(client, {})
        })
        
        it("read profile from channel messages", async () => {
            const state = await mamClient.createMam()
            await mamClient.publish(JSON.stringify({put: {
                name: "Horst",
                nummer: 3
            }}), state.mam, state.iota)
            await mamClient.publish(JSON.stringify({put: {
                name: "Horst",
                surname: "Mustermann"
            }}), state.mam, state.iota)
            await mamClient.publish(JSON.stringify({delete: ["nummer"]}), state.mam, state.iota)

            const client = await mamClient.createMam(state.mam.seed)
            await assertProfile(client, {
                name: "Horst",
                surname: "Mustermann"
            })
        })

        it("publish message in profile, delete property and read it", async () => {
            const client = await mamClient.createMam()
            await tic.profile.putInfo(client, {
                    name: "Horst",
                    number: 3
                })
            await tic.profile.removeInfo(client, ["number"])
            assertProfile(client, {
                name: "Horst"
            })
        })
    })

    describe("testing contacts with random mamClient", () => {
        it("Read empty channel", async () => {
            const client = await mamClient.createMam()
            await assertContacts(client, [])
        })

        it("should read contacts from multiple messages", async () => {
            const state = await mamClient.createMam()
            await mamClient.publish(JSON.stringify({trust: ["A", "B"]}), state.mam, state.iota)
            await mamClient.publish(JSON.stringify({distrust: ["A"]}), state.mam, state.iota)

            const client = await mamClient.createMam(state.mam.seed)
            await assertContacts(client, [{
                B: "trust",
            }, {
                A: "distrust"
            }])
        })

        it("should publish add and remove contacts and read channel", async () => {
            const client = await mamClient.createMam()
            await tic.contacts.distrust(client, ["B", "C"])
            await tic.contacts.trust(client, ["B", "D"])

            await assertContacts(client, [{
                C: "distrust"
            }, {
                B: "trust"
            }, {
                D: "trust"
            }])
        })
    })
})

const assertProfile = async (client, expected) => {
    const content = await tic.profile.get(client.channelRoot, client.iota)
    console.log("Content:", content)
    expect(content).to.deep.equal(expected)
};

const assertContacts = async (client, expected) => {
    const content = await tic.contacts.get(client.channelRoot, client.iota)
    console.log("Content:", content)
    expect(content).to.have.deep.members(expected)
};