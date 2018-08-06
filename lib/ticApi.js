let mamClient = require("mam.tools.js")
const messageBuilder = require("./chainMessageBuilder")
const log = require('mam.tools.js/lib/logger').log
const Contact = require('./types')
const debug = require('debug')('tic')

const channelOrder = ["profile", "contacts"]

const asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array)
    }
};

const asyncParallel = async (array, callback) => {
    const pms = []
    for (let index = 0; index < array.length; index++) {
        pms.push(callback(array[index], index, array))
    }
    await asyncForEach(pms, async (p, i) => {
        await p
    })
}

const asyncForStreams = async (cb, container) => asyncForEach(channelOrder, async (key) => {
    if (container) {
        value = container[key]
    }
    await cb(key, value)
});

/**
 * The TIC library for node.js.
 * @exports ticApi
 * @typicalname tic
 * @example
 * const tic = require('tic.api.js')
 */
const tic = {}

/**
 * Sets the node to use for all requests to the tangle. The given node must
 * support pow.
 * @param {string} url the url of the node to use.
 */
tic.setProvider = mamClient.setProvider;

tic.mamClient = mamClient;

/**
 * used for creating a new tic account.
 */
tic.create = {
    /** 
     * Creates two random seeds for the profile and contacts channels. 
     * The roots of these channels are stored on the public master channel created by the given seed.
     * If configured the seeds of the channels are stored on the restricted channel, so that they
     * can be retrieved later by the masterSeed.
     * 
     * @async
     * @param {string} [seed = mamClient.generateSeed()] The seed for the master channel.
     * @param {IotaClass} [iota = mamClient.getIota()] The iota client for the MAM client.
     * @param {string} [password = seed] the tryte-encoded password to save the seed of the profiles channels 
     *      on the restricted master channel. if it's null the seeds are not saved.
     * @return {Promise}
     * @fulfil {module:types~TICClient} - the initialized TICClient.
     */
    from: async ({seed = mamClient.generateSeed(), password = seed, iota = mamClient.getIota()} = {}) => {
        const client = await mamClient.createMamFrom({
            seed: seed,
            iota: iota,
        })
        return tic.create.fromMasterClient(client, password)
    },

    /**
     * Creates two random seeds for the profile and contacts channels. 
     * The roots of these channels are stored on the public master channel 
     * given by the masterClient. If configured the seeds of the channels are 
     * stored on the restricted channel, so that they
     * can be retrieved later by the masterSeed.
     * 
     * @async
     * @param {MAMClient} masterClient The MAMClient for the master channel.
     * @param {boolean} [password = masterClient.mam.channel.seed] the tryte-encoded password 
     *      to save the seed of the profiles channels on the restricted master channel. 
     *      if it's null the seeds are not saved.
     * @return {Promise}
     * @fulfil {module:types~TICClient} - the initialized TICClient.
     */
    fromMasterClient: async (masterClient, password = masterClient.mam.seed) => {
        const seeds = {}
        channelOrder.forEach(k => seeds[k] = mamClient.generateSeed())

        const iota = masterClient.iota
        if (password) {
            log.info("Saving channel seeds in restricted channel")
            const seedClient = await mamClient.createMamFrom({
                seed: masterClient.mam.seed, 
                mode: 'restricted', 
                sideKey: password,
                iota: iota
            })
            
            await asyncForStreams(async (key, seed) => {
                const result = await mamClient.publish(seed, seedClient.mam, iota, false) //seed is payload in restricted stream
                seedClient.mam = result.mamState
            }, seeds)
        }
        const channelRoot = masterClient.channelRoot
        let mamState = masterClient.mam
        if (masterClient.mam.channel.mode != 'public') {
            mamState = (await mamClient.changeMode(mamState, 'public')).mam
        }
        
        log.log('info', "Publishing channel roots in public stream")
        const mams = {}
        await asyncForStreams(async (key, seed) => {
            debug(`creating client for ${key}...`)
            mams[key] = await mamClient.createMamFrom({
                seed: seed,
                iota: iota
            })

            debug(`Publishing ${key} channel root: ${mams[key].channelRoot}`)
            const result = await mamClient.publish(mams[key].channelRoot, mamState, iota, false)
            mamState = result.mamState
        }, seeds)
        log.log('info', "Creating TIC completed")

        const result = {
            masterClient: {
                mam: mamState,
                channelRoot: channelRoot,
                iota: iota
            },
            channelClients: mams,
            masterRoot: channelRoot,
            password: password
        }
        Object.keys(seeds).forEach(k => result[k] = mams[k])
        return result
    }
};

/**
 * used to initalize an existing tic account
 */
tic.init = {
    /**
     * Initializes a {@link module:types~TICClient} from a masterSeed by retrieving the 
     * channel seeds from the restricted MAM channel with the password.
     * If the seeds are not stored in the restricted channel the channel MAMClients 
     * will be returned undefined.
     * 
     * @async
     * @param {string} masterSeed The seed for the master channel.
     * @param {string} [password = masterSeed] the tryte-encoded password used
     *      to save the seed of the profiles channels on the restricted master channel. 
     *      if it's null the seeds are not retrieved.
     * @param {IotaClass} [iota = mamClient.getIota()] The iota client for the MAM client.
     * @return {Promise}
     * @fulfil {module:types~TICClient} - the initialized TICClient.
     */
    fromMasterSeed: async ({masterSeed, password = masterSeed,  iota = mamClient.getIota()} = {}) => {
        const client = await mamClient.createMam(masterSeed, iota)
        return tic.init.fromMam(client, password)
    },

    /**
     * Initializes a {@link module:types~TICClient} from a masterClient by retrieving the channel seeds 
     *      from the restricted MAM channel.
     * If the seeds are not stored in the restricted channel the channel MAMClients 
     *      will be returned undefined.
     * 
     * @async
     * @param {MAMClient} masterClient The MAMClient for the master channel.
     * @param {string} [password = masterSeed] the tryte-encoded password used
     *      to save the seed of the profiles channels on the restricted master channel. 
     *      if it's null the seeds are not retrieved.
     * @return {Promise}
     * @fulfil {module:types~TICClient} - the initialized TICClient.
     */
    fromMam: async (client, password = client.mam.seed) => {
        const seeds = {}
        const iota = client.iota
        if (password) {
            debug("Reading seeds from restricted channel")
            const seedClient = await mamClient.createMamFrom({
                seed: client.mam.seed,
                mode: 'restricted',
                sideKey: password,
                iota: iota            
            })
            const { messages: seedMessages } = await mamClient.getChannelMessages(seedClient.channelRoot, seedClient.mam)
            debug(`Read ${seedMessages.length} messages`)
            if (seedMessages.length == 0) {
                log.warn("The seeds of profile and contacts channel are not save on the tangle. "
                + "Channel clients can't be initialized.")
            }
            
            seedMessages.forEach((seed, index) => {
                const key = channelOrder[index]
                seeds[key] = seed
            });
        }
        const channelRoot = client.channelRoot
        const { mam: master } = await mamClient.createMam(client.mam.seed, iota)
        return tic.init.fromSeeds(seeds, {
            mam: master,
            channelRoot: channelRoot,
            iota: iota
        }, password)
    },

    /**
     * Initializes a {@link module:types~TICClient} from a masterClient and the channel seeds.
     * If the seeds are not provided the channel MAMClients will be returned undefined.
     * 
     * @async
     * @param {Object} seeds the seed for the profileand contacts channels.
     * @property {MAMClient} seeds.profile The seed for the profile channel.
     * @property {MAMClient} seeds.contacts The seed for the contacts channel.
     * @param {MAMClient} masterClient The MAMClient for the master channel.
     * 
     * @return {Promise}
     * @fulfil {module:types~TICClient} - the initialized TICClient.
     */
    fromSeeds: async (seeds, masterClient, password = masterClient.mam.seed) => {
        if (masterClient.mam.channel.mode != 'public') {
            const r = await mamClient.changeMode(masterClient.mam, 'public')
            masterClient.mam = r.mam
            masterClient.channelRoot = r.channelRoot
        }

        debug("Init clients for profile and contacts channels")
        const mams = {}
        await asyncParallel(Object.keys(seeds), async (key) => {
            mams[key] = await mamClient.createMamFrom({
                seed: seeds[key],
                iota: masterClient.iota
            })
        })
        const result = {
            masterClient: masterClient,
            channelClients: mams,
            password: password
        }
        Object.keys(mams).forEach(k => result[k] = mams[k])
        result.masterRoot = masterClient.channelRoot
        return result
    }
}

const publishJSON = async (client, obj) => {
    const json = JSON.stringify(obj)
    log.info("Publishing json: %s", json)
    const resp = await mamClient.publish(json, client.mam, client.iota)
    client = resp.mamState
    return resp.root
}

const readChannel = async (channelRoot, iota = mamClient.getIota(), put = "put", del = "delete") => {
    const { messages } = await mamClient.getMessages(channelRoot)
    const objects = messages.map(iota.utils.fromTrytes).map(JSON.parse)
    return messageBuilder.build(objects, put, del)
};

const readChannelArray = async (channelRoot, iota = mamClient.getIota(), add = "add", remove = "remove") => {
    const { messages } = await mamClient.getMessages(channelRoot)
    const objects = messages.map(iota.utils.fromTrytes).map(JSON.parse)
    return messageBuilder.buildArray(objects, add, remove)
};

/**
 * used to modify your own tic account or read others.
 */
tic.profile = {
    /**
     * Adds the provided info to the profile MAM channel.
     * 
     * @async
     * @param {MAMClient} client the MAMClient of the profile channel.
     * @param {Object} info an Object containing contact informaton to be added to the profile.
     * @return {Promise}
     * @fulfil {string} - the root address of the attached message.
     */
    putInfo: async (client, info) => publishJSON(client, { put: info }),

    /**
     * Deletes the the specified info to the profile MAM channel.
     * 
     * @async
     * @param {MAMClient} client the MAMClient of the profile channel.
     * @param {Array.<string>} properties an array of strings containing 
     *      contact informaton properties to be deleted from the profile.
     * @return {Promise} 
     * @fulfil {string} - the root address of the attached message.
     */
    removeInfo: async (client, properties) => publishJSON(client, { delete: properties }),

    /**
     * Reads the contents of the profile MAM channel.
     * 
     * @async
     * @param {string} channelRoot the root address of the profile channel.
     * @param {IotaClass} iota The iota client for the MAM client.
     * @return {Promise} 
     * @fulfil {Object} - the compiled content of the profile MAM channel.
     */
    get: async (channelRoot, iota = mamClient.getIota()) => readChannel(channelRoot, iota)
}

/**
 * used to modify your list of contacts or get the one from others.
 */
tic.contacts = {
    /**
     * Adds the provided contacts to the trusted contacts in the contacts MAM channel.
     * 
     * @async
     * @param {MAMClient} client the MAMClient of the contacts channel.
     * @param {Array.<string>} contacts the master channel roots of the 
     *      contacts to be added to the trusted contacts.
     * @return {Promise} 
     * @fulfil {string} - the root address of the attached message.
     */
    trust: async (client, contacts) => publishJSON(client, { trust: contacts }),

    /**
     * Adds the provided contacts to the distrusted contacts in the contacts MAM channel.
     * 
     * @async
     * @param {MAMClient} client the MAMClient of the contacts channel.
     * @param {Array.<string>} contacts the master channel roots of the contacts 
     *      to be added to the distrusted contacts.
     * @return {Promise} 
     * @fulfil {string} - the root address of the attached message.
     */
    distrust: async (client, contacts) => publishJSON(client, { distrust: contacts }),

    /**
     * Reads the contents of the contacts MAM channel.
     * 
     * @async
     * @param {string} contactsRoot the root address of the contacts channel.
     * @param {IotaClass} iota The iota client for the MAM client.
     * @return {Promise} 
     * @fulfil {Array} - an array of master channel 
     *      roots of the contacts assigned to "trust" or "distrust" compiled from the MAM channel.
     */
    get: async (contactsRoot, iota = mamClient.getIota()) => {
        const { messages } = await mamClient.getMessages(contactsRoot)
        const objects = messages.map(iota.utils.fromTrytes).map(JSON.parse)
        return messageBuilder.buildUniqueArray(objects, ["distrust", "trust"])
    }
}

const getChannelRoots = async (masterChannelRoot) => {
    const response = await mamClient.getMessages(masterChannelRoot)
    debug(`Read ${response.messages.length} messages`)
    const result = {}
    response.messages.forEach((m, index) => result[channelOrder[index]] = m)
    return result
};

tic.getChannelRoots = getChannelRoots;

const ratingFromMasterChannelRoot = async (sourceMasterChannelRoot, targetMasterChannelRoot, iota = mamClient.getIota(), depth = 5) => {
    const items = {}
    await searchContactRecursivly(sourceMasterChannelRoot, targetMasterChannelRoot, items, [], depth, iota)

    const rating = () => ({trust: 0, distrust: 0, unknown: 0})
    const flat = rating()
    Object.keys(items).filter(c => items[c].rating).forEach(c => flat[items[c].rating]++)

    const { graph, visited: contacts } = buildGraph(sourceMasterChannelRoot, items, depth)
    const visited = Object.keys(contacts).map(k => contacts[k])
    
    const weighted = rating()
    visited.filter(c => c.rating).forEach(c => weighted[c.rating] += 1 / (c.depth + 1))
    
    const perLevel = []
    visited.filter(c => c.rating).forEach(c => {
        if (!perLevel[c.depth]) {
            perLevel[c.depth] = rating()
        }
        perLevel[c.depth][c.rating]++
    })

    return {graph, visited, contacts, rating: {
        flat, weighted, perLevel
    }}
};

/**
 * used to get the rating of another tic account.
 */
tic.rating = {
    /**
     * Computes the {@link module:types~RatingSearchResult} of a given profile by taking all contacts of the source 
     * and their contacts recursivly for a given max amount of steps (depth) and summing their 
     * stored trust and distrust messages.
     * 
     * @async
     * @param {string} sourceMasterChannelRoot the source's root address of the masterChannel.
     * @param {string} targetMasterChannelRoot the channel root adress of the master channel of the target.
     * @param {IotaClass} iota an initialized iota client.
     * @param {number} [depth = 5] the amount of steps to get the contacts of the source's contacts.
     * @return {Promise} 
     * @fulfil {module:types~RatingSearchResult} - the RatingSearchResult of the target.
     */
    fromMasterChannelRoot: async (sourceMasterChannelRoot, targetMasterChannelRoot, iota = mamClient.getIota(), depth = 5) => {
        return ratingFromMasterChannelRoot(sourceMasterChannelRoot, targetMasterChannelRoot, iota, depth)
    },

    /**
     * Computes the {@link module:types~RatingSearchResult} of a given profile by taking all contacts of the source 
     * and their contacts recursivly for a given max amount of steps (depth) and summing their 
     * stored trust and distrust messages.
     * 
     * @async
     * @param {MAMClient} masterClient the source's initialized MAMClient for the master channel.
     * @param {string} targetMasterChannelRoot the channel root adress of the master channel of the target.
     * @param {number} [depth = 5] the amount of steps to get the contacts of the source's contacts.
     * @return {Promise}
     * @fulfil {module:types~RatingSearchResult} - the RatingSearchResult of the target.
     */
    fromMasterClient: async (masterClient, targetMasterChannelRoot, depth = 5) => {
        return ratingFromMasterChannelRoot(masterClient.channelRoot, targetMasterChannelRoot, masterClient.iota, depth)
    },

    /**
     * Computes the {@link module:types~RatingSearchResult} of a given profile by taking all contacts of the source 
     * and their contacts recursivly for a given max amount of steps (depth) and summing their 
     * stored trust and distrust messages.
     * 
     * @async
     * @param {TICClient} tic the source's initialized TICClient.
     * @param {string} targetMasterChannelRoot the channel root adress of the master channel of the target.
     * @param {number} [depth = 5] the amount of steps to get the contacts of the source's contacts.
     * @return {Promise}
     * @fulfil {module:types~RatingSearchResult} - the RatingSearchResult of the target.
     */
    fromTIC: async (tic, targetMasterChannelRoot, depth = 5) => {
        return ratingFromMasterChannelRoot(tic.masterClient.channelRoot, targetMasterChannelRoot,tic.masterClient.iota, depth)
    },
}

const buildGraph = (treeRoot, contacts, depth) => {
    const graph = new Contact(treeRoot);
    const visited = {
        [graph.masterRoot]: graph
    }
    const queue = [graph]
    while (queue.length > 0) {
        const node = queue.pop();
        const info = contacts[node.masterRoot];
        // attach only visited contacts
        if (info) {
            // add retrieved properties
            node.rating = info.rating;
            node.depth = depth - info.depth;
            // add children
            if (info.contacts) {
                info.contacts.forEach(c => {
                    if (!visited[c]) {
                        const node = new Contact(c);
                        visited[c] = node;
                        queue.push(node);
                    }
                    node.contacts.push(visited[c]);
                });
            }
        }
    }
    return { graph, visited };
};

const findRating = (contacts, target) => {
    for (t of contacts) {
        if (t[target]) {
            return t[target]
        }
    }
    return 'unknown'
};

const searchContactRecursivly = async (masterRoot, target, result, visited, depth, iota) => {
    const { contacts: cr } = await getChannelRoots(masterRoot)
    visited.push(masterRoot)
    const trusts = await tic.contacts.get(cr, iota)
    debug(`Visiting ${masterRoot}`)
    const contacts = []
    trusts.forEach(t => 
        Object.keys(t).filter(k => t[k] == 'trust' || k == target).forEach(k => contacts.push(k)))
    let rating = findRating(trusts, target)
    if (masterRoot != target) { //don't add contact ratings that are for your own account
        result[masterRoot] = {contacts, rating, depth}
        debug(`Added ${masterRoot} to result.`)
        
        if (depth > 0) {
            debug(`Querying children: [${trusts.map(c => Object.keys(c)[0])}]`)
            await asyncParallel(trusts, async (t) => {
                let channelRoot = "";
                Object.keys(t).forEach(key => channelRoot = key) //there is only one key
                //don't visit already read contacts
                if (!visited.includes(channelRoot)) {
                    // don't visit contacts that are distrusted
                    if (t[channelRoot] == 'trust') {
                        await searchContactRecursivly(channelRoot, target, result, visited, depth - 1, iota)
                    } else {
                        debug(`${channelRoot} is distrusted. Don't visiting it.`)
                        // you want to have the target represented in the tree 
                        // even if it's distrusted.
                        if (channelRoot == target) {
                            debug(`Added distrusted target to result.`)
                            result[channelRoot] = {depth: depth - 1}
                        }
                    }
                } else {
                    // updating the depth of already visited contact if it's found closer to
                    // the root than seen before
                    debug(`Already visited ${channelRoot}. Checking depth...`)
                    if (result[channelRoot].depth < depth) {
                        result[channelRoot].depth = depth
                    }
                }
            })
        }
    } else {
        if (!visited.includes(masterRoot)) {
            debug(`Visited target. Adding it to result`)
            // adding the target of the search to the result
            result[masterRoot] = {contacts, depth}
        } else {
            if (result[masterRoot]) {
                debug(`Already visited target. Checking depth...`)
                // updating the depth of already added target if it's found closer to
                // the root than seen before.
                if (result[masterRoot].depth < depth) {
                    result[masterRoot].depth = depth
                    result[masterRoot].contacts = contacts
                }
            } else {
                debug(`Added target to result.`)
                result[masterRoot] = {depth, contacts}
            }
        }
    }
};

module.exports = tic;