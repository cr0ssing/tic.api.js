const {log, setTimestamp} = require('mam.tools.js/lib/logger');
setTimestamp(false);
const tic = require('./ticApi');
const mamClient = require('mam.tools.js');

(async () => {    
    try{
        var args = require('minimist')(process.argv.slice(2))
        if (args.saveSeeds) {
            args.saveSeeds = (args.saveSeeds === 'true')
        }
        const command = args._[0]
        delete args._
        args.command = command
        log.info("Parameters given:\n%o", args)
        if (args.provider) {
            mamClient.setProvider(args.provider)
            args.iota = mamClient.getIota()
        } else {
            log.error("Provider node URL must be given to use cli.")
            return;
        }
        
        
        if(command == 'create') {
            log.info("Creating tic account")
            args.password = getPw(args)
            const client = await tic.create.from(args)
            logClient(client)
            return;
        }
        
        if (command == 'read') {
            await read(args)
            return;
        }
        const publish = {
            putInfo: 'profile',
            removeInfo: 'profile',
            trust: 'contacts',
            distrust: 'contacts'
        }
        if (Object.keys(publish).indexOf(command) >= 0) {
            const channel = publish[command]
            let client = undefined
            if (args.seed) {
                const ticClient = await tic.init.fromMasterSeed(args.seed, getPw(args), args.iota)
                client = ticClient[channel]
                if (!client) {
                    log.error("Channel client can't be used with master seed for this account.")
                    return;
                }
            } else {
                if (args[channel + 'Seed']) {
                    client = await mamClient.createMamFrom({
                        seed: args[channel + 'Seed'],
                        iota: args.iota
                    })
                } else {
                    log.error(`Master seed or ${channel} seed is needed to add info to profile.`)
                    return;
                }
            }
            if (args.content) {
                const info = JSON.parse(args.content)
                log.info(`Publishing ${command} to the ${channel} of tic account.`)
                await tic[channel][command](client, info)
                return;
            } else {
                log.error("No content was set to write to the tangle.")
                return;
            }
        }
        if (command == 'rating') {
            let source = undefined
            if (args.masterRoot) {
                source = args.masterRoot
                //this is necessary to set iota in Mam lib
                await mamClient.createMamFrom({iota: args.iota})
            } else {
                if (args.seed) {
                    const ticClient = await tic.init.fromMasterSeed(args.seed, null, args.iota)
                    source = ticClient.masterRoot
                } else {
                    log.error("Seed or masterRoot is needed to compute rating")
                    return;
                }
            }
            if (args.target) {
                log.info(`Computing rating for account '${args.target}'.`)
                let result = undefined
                if (args.depth) {
                    result = await tic.rating.fromMasterChannelRoot(source, args.target, args.iota, args.depth)
                } else {
                    result = await tic.rating.fromMasterChannelRoot(source, args.target, args.iota)
                }
                log.info("Ratings: %o", result.rating.flat)
                log.info("Tree: (<masterRoot>: <rating> <depth in the tree>)")
                printTree(result.graph, r => `${r.masterRoot}: ${r.rating} ${r.depth}`)
            }
            return;
        }
        log.error(`Command ${command} is unknown.`)
    } catch(err) {
        log.error(err)
    }
})();

const printTree = (r, format, depth = 0, visited = []) => {
    let s = ""
    for (i = 0; i < depth; i++) {
        s += "  "
    }
    log.info(s + format(r))

    if (visited.indexOf(r) == -1) {
        visited.push(r)
        r.contacts.forEach(c => {
            printTree(c, format, depth + 1, visited)
        })
    }
};

function getPw(args) {
    let pw = args.password || args.seed
    if (pw === 'null') {
        pw = null
    }
    return pw
}

async function read(args) {
    let profile = undefined, contacts = undefined
    if (args.seed) {
        const pw = getPw(args)
        log.info("Getting channel roots from seed")
        const client = await tic.init.fromMasterSeed(args.seed, pw, args.iota)
        logClient(client)
        if (client.profile) {
            profile = client.profile.channelRoot
        }
        if (client.contacts) {
            contacts = client.contacts.channelRoot
        }
        if (!(profile || contacts)) {
            const r = await tic.getChannelRoots(client.masterRoot);
            profile = r.profile
            contacts = r.contacts
        }
    } else {
        if (args.masterRoot) {
            //this is necessary to set iota in Mam lib
            await mamClient.createMamFrom({iota: args.iota})
            log.info("Getting channel roots from master root")
            const r = await tic.getChannelRoots(args.masterRoot);
            profile = r.profile
            contacts = r.contacts
        }
    }
    if (!(profile || contacts)) {
        if (!(args.profileRoot || args.contactsRoot)) {
            log.error("Channel roots or account seed is needed to read account")
            return;
        } else {
            profile = args.profileRoot
            contacts = args.contactsRoot
            //this is necessary to set iota in Mam lib
            await mamClient.createMamFrom({iota: args.iota})
        }
    } else {
        log.info("Profile Root: %s", profile)
        log.info("Contacts Root: %s", contacts)
    }
    log.info("Reading content of tic account...")
    if (profile) {
        const profileContent = await tic.profile.get(profile, args.iota)
        if (Object.keys(profileContent).length == 0) {
            log.info("No profile info published.")
        } else {
            log.info("Profile:\n%o", profileContent)
        }
    }
    if (contacts) {
        const contactsContent = await tic.contacts.get(contacts, args.iota)
        if (contactsContent.length == 0) {
            log.info("No contact info published.")
        } else {
            log.info("Contacts:\n%O", contactsContent)
        }   
    }
}

const logClient = (client) => {
    log.info("Master seed: %s", client.masterClient.mam.seed)
    log.info("Master channel root: %s", client.masterRoot)
    if (client.profile) {
        log.info("Profile seed: %s", client.profile.mam.seed)
    }
    if (client.contacts) {
        log.info("Contacts seed: %s", client.contacts.mam.seed)
    }
}