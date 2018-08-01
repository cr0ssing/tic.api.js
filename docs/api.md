# API Reference
The TIC library for node.js.

**Example**  
```js
const tic = require('tic.api.js')
```

* [ticApi](#module_ticApi)
    * [.setProvider](#module_ticApi.setProvider)
    * [.create](#module_ticApi.create)
        * [.from([seed], [iota], [password])](#module_ticApi.create.from) ⇒ <code>Promise</code>
        * [.fromMasterClient(masterClient, [password])](#module_ticApi.create.fromMasterClient) ⇒ <code>Promise</code>
    * [.init](#module_ticApi.init)
        * [.fromMasterSeed(masterSeed, [password], [iota])](#module_ticApi.init.fromMasterSeed) ⇒ <code>Promise</code>
        * [.fromMam(masterClient, [password])](#module_ticApi.init.fromMam) ⇒ <code>Promise</code>
        * [.fromSeeds(seeds, masterClient)](#module_ticApi.init.fromSeeds) ⇒ <code>Promise</code>
    * [.profile](#module_ticApi.profile)
        * [.putInfo(client, info)](#module_ticApi.profile.putInfo) ⇒ <code>Promise</code>
        * [.removeInfo(client, properties)](#module_ticApi.profile.removeInfo) ⇒ <code>Promise</code>
        * [.get(channelRoot, iota)](#module_ticApi.profile.get) ⇒ <code>Promise</code>
    * [.contacts](#module_ticApi.contacts)
        * [.trust(client, contacts)](#module_ticApi.contacts.trust) ⇒ <code>Promise</code>
        * [.distrust(client, contacts)](#module_ticApi.contacts.distrust) ⇒ <code>Promise</code>
        * [.get(contactsRoot, iota)](#module_ticApi.contacts.get) ⇒ <code>Promise</code>
    * [.rating](#module_ticApi.rating)
        * [.fromMasterChannelRoot(sourceMasterChannelRoot, targetMasterChannelRoot, iota, [depth])](#module_ticApi.rating.fromMasterChannelRoot) ⇒ <code>Promise</code>
        * [.fromMasterClient(masterClient, targetMasterChannelRoot, [depth])](#module_ticApi.rating.fromMasterClient) ⇒ <code>Promise</code>
        * [.fromTIC(tic, targetMasterChannelRoot, [depth])](#module_ticApi.rating.fromTIC) ⇒ <code>Promise</code>

<a name="module_ticApi.setProvider"></a>

### tic.setProvider
Sets the node to use for all requests to the tangle. The given node mustsupport pow.

**Kind**: static property of [<code>ticApi</code>](#module_ticApi)  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | the url of the node to use. |

<a name="module_ticApi.create"></a>

### tic.create
used for creating a new tic account.

**Kind**: static property of [<code>ticApi</code>](#module_ticApi)  

* [.create](#module_ticApi.create)
    * [.from([seed], [iota], [password])](#module_ticApi.create.from) ⇒ <code>Promise</code>
    * [.fromMasterClient(masterClient, [password])](#module_ticApi.create.fromMasterClient) ⇒ <code>Promise</code>

<a name="module_ticApi.create.from"></a>

#### create.from([seed], [iota], [password]) ⇒ <code>Promise</code>
Creates two random seeds for the profile and contacts channels. The roots of these channels are stored on the public master channel created by the given seed.If configured the seeds of the channels are stored on the restricted channel, so that theycan be retrieved later by the masterSeed.

**Kind**: static method of [<code>create</code>](#module_ticApi.create)  
**Fulfil**: [<code>TICClient</code>](#module_types..TICClient) - the initialized TICClient.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [seed] | <code>string</code> | <code>&quot;mamClient.generateSeed()&quot;</code> | The seed for the master channel. |
| [iota] | <code>IotaClass</code> | <code>mamClient.getIota()</code> | The iota client for the MAM client. |
| [password] | <code>string</code> | <code>&quot;seed&quot;</code> | the tryte-encoded password to save the seed of the profiles channels       on the restricted master channel. if it's null the seeds are not saved. |

<a name="module_ticApi.create.fromMasterClient"></a>

#### create.fromMasterClient(masterClient, [password]) ⇒ <code>Promise</code>
Creates two random seeds for the profile and contacts channels. The roots of these channels are stored on the public master channel given by the masterClient. If configured the seeds of the channels are stored on the restricted channel, so that theycan be retrieved later by the masterSeed.

**Kind**: static method of [<code>create</code>](#module_ticApi.create)  
**Fulfil**: [<code>TICClient</code>](#module_types..TICClient) - the initialized TICClient.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| masterClient | <code>MAMClient</code> |  | The MAMClient for the master channel. |
| [password] | <code>boolean</code> | <code>masterClient.mam.channel.seed</code> | the tryte-encoded password       to save the seed of the profiles channels on the restricted master channel.       if it's null the seeds are not saved. |

<a name="module_ticApi.init"></a>

### tic.init
used to initalize an existing tic account

**Kind**: static property of [<code>ticApi</code>](#module_ticApi)  

* [.init](#module_ticApi.init)
    * [.fromMasterSeed(masterSeed, [password], [iota])](#module_ticApi.init.fromMasterSeed) ⇒ <code>Promise</code>
    * [.fromMam(masterClient, [password])](#module_ticApi.init.fromMam) ⇒ <code>Promise</code>
    * [.fromSeeds(seeds, masterClient)](#module_ticApi.init.fromSeeds) ⇒ <code>Promise</code>

<a name="module_ticApi.init.fromMasterSeed"></a>

#### init.fromMasterSeed(masterSeed, [password], [iota]) ⇒ <code>Promise</code>
Initializes a [TICClient](#module_types..TICClient) from a masterSeed by retrieving the channel seeds from the restricted MAM channel with the password.If the seeds are not stored in the restricted channel the channel MAMClients will be returned undefined.

**Kind**: static method of [<code>init</code>](#module_ticApi.init)  
**Fulfil**: [<code>TICClient</code>](#module_types..TICClient) - the initialized TICClient.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| masterSeed | <code>string</code> |  | The seed for the master channel. |
| [password] | <code>string</code> | <code>&quot;masterSeed&quot;</code> | the tryte-encoded password used      to save the seed of the profiles channels on the restricted master channel.       if it's null the seeds are not retrieved. |
| [iota] | <code>IotaClass</code> | <code>mamClient.getIota()</code> | The iota client for the MAM client. |

<a name="module_ticApi.init.fromMam"></a>

#### init.fromMam(masterClient, [password]) ⇒ <code>Promise</code>
Initializes a [TICClient](#module_types..TICClient) from a masterClient by retrieving the channel seeds      from the restricted MAM channel.If the seeds are not stored in the restricted channel the channel MAMClients      will be returned undefined.

**Kind**: static method of [<code>init</code>](#module_ticApi.init)  
**Fulfil**: [<code>TICClient</code>](#module_types..TICClient) - the initialized TICClient.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| masterClient | <code>MAMClient</code> |  | The MAMClient for the master channel. |
| [password] | <code>string</code> | <code>&quot;masterSeed&quot;</code> | the tryte-encoded password used      to save the seed of the profiles channels on the restricted master channel.       if it's null the seeds are not retrieved. |

<a name="module_ticApi.init.fromSeeds"></a>

#### init.fromSeeds(seeds, masterClient) ⇒ <code>Promise</code>
Initializes a [TICClient](#module_types..TICClient) from a masterClient and the channel seeds.If the seeds are not provided the channel MAMClients will be returned undefined.

**Kind**: static method of [<code>init</code>](#module_ticApi.init)  
**Fulfil**: [<code>TICClient</code>](#module_types..TICClient) - the initialized TICClient.  

| Param | Type | Description |
| --- | --- | --- |
| seeds | <code>Object</code> | the seed for the profileand contacts channels. |
| masterClient | <code>MAMClient</code> | The MAMClient for the master channel. |

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| seeds.profile | <code>MAMClient</code> | The seed for the profile channel. |
| seeds.contacts | <code>MAMClient</code> | The seed for the contacts channel. |

<a name="module_ticApi.profile"></a>

### tic.profile
used to modify your own tic account or read others.

**Kind**: static property of [<code>ticApi</code>](#module_ticApi)  

* [.profile](#module_ticApi.profile)
    * [.putInfo(client, info)](#module_ticApi.profile.putInfo) ⇒ <code>Promise</code>
    * [.removeInfo(client, properties)](#module_ticApi.profile.removeInfo) ⇒ <code>Promise</code>
    * [.get(channelRoot, iota)](#module_ticApi.profile.get) ⇒ <code>Promise</code>

<a name="module_ticApi.profile.putInfo"></a>

#### profile.putInfo(client, info) ⇒ <code>Promise</code>
Adds the provided info to the profile MAM channel.

**Kind**: static method of [<code>profile</code>](#module_ticApi.profile)  
**Fulfil**: <code>string</code> - the root address of the attached message.  

| Param | Type | Description |
| --- | --- | --- |
| client | <code>MAMClient</code> | the MAMClient of the profile channel. |
| info | <code>Object</code> | an Object containing contact informaton to be added to the profile. |

<a name="module_ticApi.profile.removeInfo"></a>

#### profile.removeInfo(client, properties) ⇒ <code>Promise</code>
Deletes the the specified info to the profile MAM channel.

**Kind**: static method of [<code>profile</code>](#module_ticApi.profile)  
**Fulfil**: <code>string</code> - the root address of the attached message.  

| Param | Type | Description |
| --- | --- | --- |
| client | <code>MAMClient</code> | the MAMClient of the profile channel. |
| properties | <code>Array.&lt;string&gt;</code> | an array of strings containing       contact informaton properties to be deleted from the profile. |

<a name="module_ticApi.profile.get"></a>

#### profile.get(channelRoot, iota) ⇒ <code>Promise</code>
Reads the contents of the profile MAM channel.

**Kind**: static method of [<code>profile</code>](#module_ticApi.profile)  
**Fulfil**: <code>Object</code> - the compiled content of the profile MAM channel.  

| Param | Type | Description |
| --- | --- | --- |
| channelRoot | <code>string</code> | the root address of the profile channel. |
| iota | <code>IotaClass</code> | The iota client for the MAM client. |

<a name="module_ticApi.contacts"></a>

### tic.contacts
used to modify your list of contacts or get the one from others.

**Kind**: static property of [<code>ticApi</code>](#module_ticApi)  

* [.contacts](#module_ticApi.contacts)
    * [.trust(client, contacts)](#module_ticApi.contacts.trust) ⇒ <code>Promise</code>
    * [.distrust(client, contacts)](#module_ticApi.contacts.distrust) ⇒ <code>Promise</code>
    * [.get(contactsRoot, iota)](#module_ticApi.contacts.get) ⇒ <code>Promise</code>

<a name="module_ticApi.contacts.trust"></a>

#### contacts.trust(client, contacts) ⇒ <code>Promise</code>
Adds the provided contacts to the trusted contacts in the contacts MAM channel.

**Kind**: static method of [<code>contacts</code>](#module_ticApi.contacts)  
**Fulfil**: <code>string</code> - the root address of the attached message.  

| Param | Type | Description |
| --- | --- | --- |
| client | <code>MAMClient</code> | the MAMClient of the contacts channel. |
| contacts | <code>Array.&lt;string&gt;</code> | the master channel roots of the       contacts to be added to the trusted contacts. |

<a name="module_ticApi.contacts.distrust"></a>

#### contacts.distrust(client, contacts) ⇒ <code>Promise</code>
Adds the provided contacts to the distrusted contacts in the contacts MAM channel.

**Kind**: static method of [<code>contacts</code>](#module_ticApi.contacts)  
**Fulfil**: <code>string</code> - the root address of the attached message.  

| Param | Type | Description |
| --- | --- | --- |
| client | <code>MAMClient</code> | the MAMClient of the contacts channel. |
| contacts | <code>Array.&lt;string&gt;</code> | the master channel roots of the contacts       to be added to the distrusted contacts. |

<a name="module_ticApi.contacts.get"></a>

#### contacts.get(contactsRoot, iota) ⇒ <code>Promise</code>
Reads the contents of the contacts MAM channel.

**Kind**: static method of [<code>contacts</code>](#module_ticApi.contacts)  
**Fulfil**: <code>Array</code> - an array of master channel      roots of the contacts assigned to "trust" or "distrust" compiled from the MAM channel.  

| Param | Type | Description |
| --- | --- | --- |
| contactsRoot | <code>string</code> | the root address of the contacts channel. |
| iota | <code>IotaClass</code> | The iota client for the MAM client. |

<a name="module_ticApi.rating"></a>

### tic.rating
used to get the rating of another tic account.

**Kind**: static property of [<code>ticApi</code>](#module_ticApi)  

* [.rating](#module_ticApi.rating)
    * [.fromMasterChannelRoot(sourceMasterChannelRoot, targetMasterChannelRoot, iota, [depth])](#module_ticApi.rating.fromMasterChannelRoot) ⇒ <code>Promise</code>
    * [.fromMasterClient(masterClient, targetMasterChannelRoot, [depth])](#module_ticApi.rating.fromMasterClient) ⇒ <code>Promise</code>
    * [.fromTIC(tic, targetMasterChannelRoot, [depth])](#module_ticApi.rating.fromTIC) ⇒ <code>Promise</code>

<a name="module_ticApi.rating.fromMasterChannelRoot"></a>

#### rating.fromMasterChannelRoot(sourceMasterChannelRoot, targetMasterChannelRoot, iota, [depth]) ⇒ <code>Promise</code>
Computes the [RatingSearchResult](#module_types..RatingSearchResult) of a given profile by taking all contacts of the source and their contacts recursivly for a given max amount of steps (depth) and summing their stored trust and distrust messages.

**Kind**: static method of [<code>rating</code>](#module_ticApi.rating)  
**Fulfil**: [<code>RatingSearchResult</code>](#module_types..RatingSearchResult) - the RatingSearchResult of the target.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| sourceMasterChannelRoot | <code>string</code> |  | the source's root address of the masterChannel. |
| targetMasterChannelRoot | <code>string</code> |  | the channel root adress of the master channel of the target. |
| iota | <code>IotaClass</code> |  | an initialized iota client. |
| [depth] | <code>number</code> | <code>5</code> | the amount of steps to get the contacts of the source's contacts. |

<a name="module_ticApi.rating.fromMasterClient"></a>

#### rating.fromMasterClient(masterClient, targetMasterChannelRoot, [depth]) ⇒ <code>Promise</code>
Computes the [RatingSearchResult](#module_types..RatingSearchResult) of a given profile by taking all contacts of the source and their contacts recursivly for a given max amount of steps (depth) and summing their stored trust and distrust messages.

**Kind**: static method of [<code>rating</code>](#module_ticApi.rating)  
**Fulfil**: [<code>RatingSearchResult</code>](#module_types..RatingSearchResult) - the RatingSearchResult of the target.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| masterClient | <code>MAMClient</code> |  | the source's initialized MAMClient for the master channel. |
| targetMasterChannelRoot | <code>string</code> |  | the channel root adress of the master channel of the target. |
| [depth] | <code>number</code> | <code>5</code> | the amount of steps to get the contacts of the source's contacts. |

<a name="module_ticApi.rating.fromTIC"></a>

#### rating.fromTIC(tic, targetMasterChannelRoot, [depth]) ⇒ <code>Promise</code>
Computes the [RatingSearchResult](#module_types..RatingSearchResult) of a given profile by taking all contacts of the source and their contacts recursivly for a given max amount of steps (depth) and summing their stored trust and distrust messages.

**Kind**: static method of [<code>rating</code>](#module_ticApi.rating)  
**Fulfil**: [<code>RatingSearchResult</code>](#module_types..RatingSearchResult) - the RatingSearchResult of the target.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| tic | <code>TICClient</code> |  | the source's initialized TICClient. |
| targetMasterChannelRoot | <code>string</code> |  | the channel root adress of the master channel of the target. |
| [depth] | <code>number</code> | <code>5</code> | the amount of steps to get the contacts of the source's contacts. |

* * *
## Types
The types listed below are used by the ticApi.


* [types](#module_types)
    * [~TICClient](#module_types..TICClient) : <code>Object</code>
    * [~Contact](#module_types..Contact) : <code>Object</code>
    * [~Rating](#module_types..Rating) : <code>Object</code>
    * [~RatingSearchResult](#module_types..RatingSearchResult) : <code>Object</code>

<a name="module_types..TICClient"></a>

### types~TICClient : <code>Object</code>
An Object containing the master MAM client and MAM clients for the profiles channel. With this objectall requests regarding a specific TIC account can be handled.

**Kind**: inner typedef of [<code>types</code>](#module_types)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| masterClient | <code>MAMClient</code> | The MAMClient for the master channel. |
| masterRoot | <code>string</code> | The channel root of the master channel. |
| channelClients | <code>Object</code> | The MAMClients for the accounts channels. |
| channelClients.profile | <code>MAMClient</code> | The MAMClient for the profile channel. |
| channelClients.contacts | <code>MAMClient</code> | The MAMClient for the contacts channel. |

<a name="module_types..Contact"></a>

### types~Contact : <code>Object</code>
An object containing information about a contact.

**Kind**: inner typedef of [<code>types</code>](#module_types)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| masterRoot | <code>string</code> | the channel root of the master channel of the contact. |
| contacts | <code>Array.&lt;Contact&gt;</code> | the contacts of the contact. |
| depth | <code>Number</code> | the highest layer of the graph, created by a [RatingSearchResult](#module_types..RatingSearchResult), where the contact exists. |
| rating | <code>string</code> | the rating (trust, distrust or unknown) that the contact gave the target of a [RatingSearchResult](#module_types..RatingSearchResult) |

<a name="module_types..Rating"></a>

### types~Rating : <code>Object</code>
An Object consisting of numbers representing the amounts of contacts rating a specific account 'trusted', 'distrusted' or 'unknown'. These numbers can be computed by specific measures (see [RatingSearchResult](#module_types..RatingSearchResult)).

**Kind**: inner typedef of [<code>types</code>](#module_types)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| trust | <code>number</code> | a number representing the amount of contacts rating a given account trustworthy. |
| distrust | <code>number</code> | a number representing the amount of contacts rating a given account not trustworthy. |
| unknown | <code>number</code> | a number representing the amount of contacts not rating a given a account. |

<a name="module_types..RatingSearchResult"></a>

### types~RatingSearchResult : <code>Object</code>
An object containing both the [Rating](#module_types..Rating) for a given contact computed by multiple measures and the  [Contact](#module_types..Contact)s visitedrecursivly in the search to derive it.

**Kind**: inner typedef of [<code>types</code>](#module_types)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| graph | <code>Contact</code> | The paths of the rating searches source account to the [Contact](#module_types..Contact)s,  created while computing the rating for a given account, in form of a graph with a single root. The root is the account  from where the search started (source account). The graph may contain cycles, so printing it may cause infinite loops.  The children of a node in the graph are the accounts that are trusted by the contacts and the target of the rating search,  even if they declared it as distrusting. |
| contacts | <code>Object</code> | An object containg all visited contacts. The keys are  the master channel roots of the contacts. Their values are the [Contact](#module_types..Contact)s themself. A contact is only visited  if it's trusted. Additionally this property includes the target of the RatingSearch as a [Contact](#module_types..Contact). |
| visited | <code>Array.&lt;Contact&gt;</code> | an array containing all visited [Contact](#module_types..Contact)s and  the target. |
| rating | <code>Object</code> | An object containing [Rating](#module_types..Rating)s derived with different measures. |
| rating.flat | <code>Rating</code> | a [Rating](#module_types..Rating) computed by considering all visited contacts equally. |
| rating.weighted | <code>Rating</code> | A [Rating](#module_types..Rating) where the value of a rating is  weighted by the lowest depth where it was found in the graph. the root has depth 0. The rating is weighted by  'rating / (depth + 1)'. |
| rating.perLevel | <code>Array.&lt;Rating&gt;</code> | An array of [Rating](#module_types..Rating)s, one for each layer of the graph. The nth element in the array contains the rating of all contacts at depth n. |


* * * 

&copy; 2018 Robin Lamberti \<lamberti.robin@gmail.com\>. Documented by [jsdoc-to-markdown](https://github.com/jsdoc2md/jsdoc-to-markdown).
