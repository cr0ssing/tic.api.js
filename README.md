# TIC - Trusted IOTA Contacts
A simple library providing a secure way to validate identities in the IOTA network.

With TIC you can publish information which you want to share about yourself on the tangle and publish that you trust or
distrust the information of someone else. The ones you trust are your 'contacts'. With this a Web of Trust is established 
by which you can validate the information of someone by accumulating the trust ratings of your contacts and their contacts 
and so on. This makes it possible to derive a trust rating for someone who is not your direct contact.

## CLI
You can use all functions of the TIC library with a simple CLI. The releases contain binaries for different platforms with
that you can use TIC standalone from the command line:
```sh
$ ticCli-linux-x86 <command> [options]
```
It's also possible to run the cli directly with node/npm:
```sh
$ npm install
$ npm run cli <command> -- [options]
```
Note the extra '--' needed before the options.

### Setting Node
The option <code>--provider</code> must be set in all commands. It should be set to the URL of an IOTA full node supporting POW.

### Commands: 
#### create    
Creates a new TIC account by generating a profile and a contacts channel and saving its channel roots on the tangle.

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| seed | <code>string</code> |  | The seed of the TIC account to create. It's used to create the public master channel of the account where the channel roots of the profile and contacts channel are published. |
| password | <code>string</code> | seed | The tryte-encoded password to save the seeds of profile and contacts channel in the restricted channel of the TIC account. If password is not given the seed is used as a default. If null is given the seeds aren't saved. If the seeds are not saved you need to remember these by yourself and pass them as params in certain requests. |

**Example**  
```sh
$ ticCli-linux-x86 create --seed=THISISTHESEEDOFTHETICACCOUNTANDISHOULDNOTGIVEITTOANYBODYELSE --provider=https://your.favorite.node
```
#### read        
Reads the content of a TIC account from the tangle.

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| seed | <code>string</code> |  | The seed of the TIC account |
| masterRoot | <code>string</code> |  | The root of the master channel of the TIC account to read |
| profileRoot | <code>string</code> |  | The channel root of the profile channel to read |
| contactsRoot | <code>string</code> |  | The channel root of the contacts channel to read |
| password | <code>string</code> | seed | The tryte-encoded password to get the seeds of profile and contacts channel in the restricted channel of the TIC account. If password is not given the seed is used as a default. If null is given the seeds aren't retrieved. |

One of these params is needed to read content from an account. The cli will look for them in descending order of the table. If profile and contacts root are given both channels are read.
The password is only needed together with the seed.

**Example**  
```sh
$ ticCli-linux-x86 read --profileRoot=RGHGRDSIUHGRDOINGGSOLHKZHSÖFJBRHVUFCFYVNEJKXDSHJGFSDSDF
    --contactsRoot=LOIRHGBVSHJRHGREIUAOCNAKSSUEGRFSJHFSDGFDJHFSFKBGHGTZUCNYS --provider=https://your.favorite.node
```
#### putInfo     
Adds the given information in JSON format to the profile of a TIC account.

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| seed | <code>string</code> | | The seed of the TIC account |
| password | <code>string</code> | seed | The tryte-encoded password of the TIC account. It's used to retrieve the channel root from the restricted channel. If password is not given the seed is used as a default. If null is given the seed can't be retrieved. |
| profileSeed | <code>string</code> | | The channel root of the profile channel to add information to |
| content | <code>string</code> | | The information to add to the profile in form of key/value pairs formatted as a JSON object. '"' might be needed to escape and the content must be wraped in '' |

Only seed or profile seed is needed for this request. Seed can only be used if channel seeds are saved on the tangle with the 
given password.

**Example**  
```sh
$ ticCli-linux-x86 putInfo --seed=DSFEDHKSZAGFZUAIUAAWBSFVHJHTRNDBGZUFGJSDGIGDHJSFHGDSJGHSFHD
    --password=IUDRHVBVSSHGDGFKSIDFHGVHDZDUSGHDFVBSJKDFUCBHDSJ
    --content='{\"name\":\"Max Mustermann\"}' --provider=https://your.favorite.node
```
#### removeInfo  
Removes the properties as a JSON array from the profile of a TIC account.

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| seed | <code>string</code> | | The seed of the TIC account |
| password | <code>string</code> | seed | The tryte-encoded password of the TIC account. It's used to retrieve the channel root from the restricted channel. If password is not given the seed is used as a default. If null is given the seed can't be retrieved. |
| profileSeed | <code>string</code> | | The channel root of the profile channel to remove information from |
| content | <code>string</code> | | The information to remove from the profile in form of the keys formatted as a JSON array. '"' might be needed to escape and the content must be wraped in '' |

Only seed or profile seed is needed for this request. Seed can only be used if channel seeds are saved on the tangle with the 
given password.
Please note that the information is not really deleted from the tangle as that is not possible. The given information could be read on the mam channel as before by everyone. This request has the effect that the TIC library will not consider the given properties in information that has been published to this profile before, when compiling the profile information.

**Example**  
```sh
$ ticCli-linux-x86 removeInfo --profileSeed=THESEEDOFTHEPROFILECHANNELOFTHETICACCOUNTWHICHNEEDSTOBEKEPTPRIVATE
    --content='[\"name\"]' --provider=https://your.favorite.node
```
#### trust       
Adds the given account to the trusted contacts of a TIC account.

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| seed | <code>string</code> | | The seed of the TIC account |
| password | <code>string</code> | seed | The tryte-encoded password of the TIC account. It's used to retrieve the channel root from the restricted channel. If password is not given the seed is used as a default. If null is given the seed can't be retrieved. |
| contactsSeed | <code>string</code> | | The channel root of the contacts channel to add trusts to |
| content | <code>string</code> | | The master channel roots of the accounts to add to the trusted contacts formatted as a JSON array. '"' might be needed to escape and the content must be wraped in '' |

Only seed or contacts seed is needed for this request. Seed can only be used if channel seeds are saved on the tangle with the 
given password.

**Example**  
```sh
$ ticCli-linux-x86 trust --contactsSeed=THESEEDOFTHECONTACTSCHANNELOFTHETICACCOUNTWHICHNEEDSTOBEKEPTPRIVATE
    --content='[\"GOEFGIEUVHFJHVDFBDHGZGFZIGXGFCDJDKSFIWFUZFIOTHGRTSIUDG\",\"UZOITRZEHSVCXKGHGEUZSVBSZGFSUZGFSZUDGFSDFSGDSHJDSDFHSDFHJDGFSDHJGFD\"]' 
    --provider=https://your.favorite.node
```
#### distrust    
Adds the given account to the distrusted contacts of a TIC account.

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| seed | <code>string</code> | | The seed of the TIC account |
| password | <code>string</code> | seed | The tryte-encoded password of the TIC account. It's used to retrieve the channel root from the restricted channel. If password is not given the seed is used as a default. If null is given the seed can't be retrieved. |
| contactsSeed | <code>string</code> | | The channel root of the contacts channel to add distrusts to |
| content | <code>string</code> | | The master channel roots of the accounts to add to the distrusted contacts formatted as a JSON array. '"' might be needed to escape and the content must be wraped in '' |

Only seed or contacts seed is needed for this request. Seed can only be used if channel seeds are saved on the tangle with the 
given password.

**Example**  
```sh
$ ticCli-linux-x86 distrust --seed=EWIVBSDFIUGRUISAGAFKGRFZEAUKGFZERGFCFEUGICGFZUDIADHVCB
    --password=GRSJDVKBJDFKLHFGSCKHDAGZFTGZCFGHCXDFKHGDHDSGHFHHSDFGHSJ
    --content='[\"GOEFGIEUVHFJHVDFBDHGZGFZIGXGFCDJDKSFIWFUZFIOTHGRTSIUDG\",\"UZOITRZEHSVCXKGHGEUZSVBSZGFSUZGFSZUDGFSDFSGDSHJDSDFHSDFHJDGFSDHJGFD\"]' 
    --provider=https://your.favorite.node
```
#### rating      
Computes the trust rating for a given account by querying the contacts of a TIC account.

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| masterRoot | <code>string</code> |  | The root of the master channel of the TIC account to base the rating query on |
| seed | <code>string</code> |  | The seed of the TIC account to base the rating query on |
| target | <code>string</code> |  | The master channel root of the TIC account to compute a trust rating of |
| depth | <code>number</code> | 5 | The maximum depth of recursive querying of contacts of contacts of contacts... |

Only masterRoot or seed is needed for this request. The CLI will look for the master root first.

**Example**  
```sh
$ ticCli-linux-x86 rating --seed=RIFHSDJCHJGDIUEAFHUIGTRJUIERNDCSLIEUGSJHKSDFHGDSDFKHSFDKSGDDS
    --target=UZOITRZEHSVCXKGHGEUZSVBSZGFSUZGFSZUDGFSDFSGDSHJDSDFHSDFHJDGFSDHJGFD
    --provider=https://your.favorite.node
```
The output of this request could look like this for example:
```sh
> info: Computing rating for account 'EARFMSCNONSALMKPH9RKJEQTPZQWOEJT9GQGFVUQEME9FXPQICSJGYWCINFLME9YGYWJZSEQPVOWZFFJV'.
> info: Ratings: { trust: 1, distrust: 2, unknown: 0 }
> info: Tree: (<masterRoot>: <rating> <depth in the tree>)
> info: UJGMXS9SGYAVYXDWGTI9FJEJPUVGIHSRDLDHNLAPFEZXMZOFHXE9LXJBTEOUAHVSWIFKUHIQQMIJPQPCT: distrust 0
> info:   Y9LTPBGZGK9GATDYIJROVIFP9OVEAIEDRLDXZEFKEDYE9KRJKSLJVJQOKUDXAZPSANHKZCJMVNIABTCBJ: trust 1
> info:     R9PLCWUAZLMLKWRMKDCPNYJSPRBLHXNJUXHKRCVWN9T9DZJZEPSFNODRVCYLY9GSDAFMEWRVPIZNYBEOY: distrust 2
> info:       EARFMSCNONSALMKPH9RKJEQTPZQWOEJT9GQGFVUQEME9FXPQICSJGYWCINFLME9YGYWJZSEQPVOWZFFJV: undefined 1
> info:     EARFMSCNONSALMKPH9RKJEQTPZQWOEJT9GQGFVUQEME9FXPQICSJGYWCINFLME9YGYWJZSEQPVOWZFFJV: undefined 1
> info:   EARFMSCNONSALMKPH9RKJEQTPZQWOEJT9GQGFVUQEME9FXPQICSJGYWCINFLME9YGYWJZSEQPVOWZFFJV: undefined 1
```
The second line holds a summary of all trust ratings collected from the queryied TIC accounts. It shows the amount of accounts having the target account in the trusted contacts, 
in their distrusted contacts and the amount of TIC accounts who don't have the target in their contacts at all. These are called 'unknown' ratings.

The following lines show a tree of all queryied TIC accounts. Each line consists of the master channel root of the account followed
by the rating of this account for the target followed by the depth in the tree where it was first found. The first line is your TIC account given by seed or masterRoot.

The depth is also shown by the indent of a line. The contacts of a account have a higher indent as their 'parent'. Queryied are all contacts
of an account that this account trusts. 

If a contact has the target in its contacts, trusting or distrusting, the target is shown
as a contact of this account in this tree. The target has an undefined rating because ratings for someones own account are not considered.
* * *
## API Reference
The TIC library for node.js.

**Example**  
```js
const tic = require('tic.api.js')
```

* [ticApi](#module_ticApi)
    * [.setProvider](#module_ticApi.setProvider)
    * [.create](#module_ticApi.create)
        * [.from([seed], [iota], [password])](#module_ticApi.create.from) ⇒ <code>Promise.&lt;TICClient&gt;</code>
        * [.fromMasterClient(masterClient, [password])](#module_ticApi.create.fromMasterClient) ⇒ <code>Promise.&lt;TICClient&gt;</code>
    * [.init](#module_ticApi.init)
        * [.fromMasterSeed(masterSeed, [password], [iota])](#module_ticApi.init.fromMasterSeed) ⇒ <code>Promise.&lt;TICClient&gt;</code>
        * [.fromMam(masterClient, [password])](#module_ticApi.init.fromMam) ⇒ <code>Promise.&lt;TICClient&gt;</code>
        * [.fromSeeds(seeds, masterClient)](#module_ticApi.init.fromSeeds) ⇒ <code>Promise.&lt;TICClient&gt;</code>
    * [.profile](#module_ticApi.profile)
        * [.putInfo(client, info)](#module_ticApi.profile.putInfo) ⇒ <code>Promise.&lt;string&gt;</code>
        * [.removeInfo(client, properties)](#module_ticApi.profile.removeInfo) ⇒ <code>Promise.&lt;string&gt;</code>
        * [.get(channelRoot, iota)](#module_ticApi.profile.get) ⇒ <code>Promise.&lt;Object&gt;</code>
    * [.contacts](#module_ticApi.contacts)
        * [.trust(client, contacts)](#module_ticApi.contacts.trust) ⇒ <code>Promise.&lt;string&gt;</code>
        * [.distrust(client, contacts)](#module_ticApi.contacts.distrust) ⇒ <code>Promise.&lt;string&gt;</code>
        * [.get(contactsRoot, iota)](#module_ticApi.contacts.get) ⇒ <code>Promise.&lt;Array&gt;</code>
    * [.rating](#module_ticApi.rating)
        * [.fromMasterChannelRoot(sourceMasterChannelRoot, targetMasterChannelRoot, iota, [depth])](#module_ticApi.rating.fromMasterChannelRoot) ⇒ <code>Promise.&lt;RatingSearchResult&gt;</code>
        * [.fromMasterClient(masterClient, targetMasterChannelRoot, [depth])](#module_ticApi.rating.fromMasterClient) ⇒ <code>Promise.&lt;RatingSearchResult&gt;</code>
        * [.fromTIC(tic, targetMasterChannelRoot, [depth])](#module_ticApi.rating.fromTIC) ⇒ <code>Promise.&lt;RatingSearchResult&gt;</code>

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
    * [.from([seed], [iota], [password])](#module_ticApi.create.from) ⇒ <code>Promise.&lt;TICClient&gt;</code>
    * [.fromMasterClient(masterClient, [password])](#module_ticApi.create.fromMasterClient) ⇒ <code>Promise.&lt;TICClient&gt;</code>

<a name="module_ticApi.create.from"></a>

#### create.from([seed], [iota], [password]) ⇒ <code>Promise.&lt;TICClient&gt;</code>
Creates two random seeds for the profile and contacts channels. The roots of these channels are stored on the public master channel created by the given seed.If configured the seeds of the channels are stored on the restricted channel, so that theycan be retrieved later by the masterSeed.

**Kind**: static method of [<code>create</code>](#module_ticApi.create)  
**Returns**: <code>Promise.&lt;TICClient&gt;</code> - a Promise awaiting the initialized TICClient.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [seed] | <code>string</code> | <code>&quot;mamClient.generateSeed()&quot;</code> | The seed for the master channel. |
| [iota] | <code>IotaClass</code> | <code>mamClient.getIota()</code> | The iota client for the MAM client. |
| [password] | <code>string</code> | <code>&quot;seed&quot;</code> | the tryte-encoded password to save the seed of the profiles channels       on the restricted master channel. if it's null the seeds are not saved. |

<a name="module_ticApi.create.fromMasterClient"></a>

#### create.fromMasterClient(masterClient, [password]) ⇒ <code>Promise.&lt;TICClient&gt;</code>
Creates two random seeds for the profile and contacts channels. The roots of these channels are stored on the public master channel given by the masterClient. If configured the seeds of the channels are stored on the restricted channel, so that theycan be retrieved later by the masterSeed.

**Kind**: static method of [<code>create</code>](#module_ticApi.create)  
**Returns**: <code>Promise.&lt;TICClient&gt;</code> - a Promise awaiting the initialized TICClient.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| masterClient | <code>MAMClient</code> |  | The MAMClient for the master channel. |
| [password] | <code>boolean</code> | <code>masterClient.mam.channel.seed</code> | the tryte-encoded password       to save the seed of the profiles channels on the restricted master channel.       if it's null the seeds are not saved. |

<a name="module_ticApi.init"></a>

### tic.init
used to initalize an existing tic account

**Kind**: static property of [<code>ticApi</code>](#module_ticApi)  

* [.init](#module_ticApi.init)
    * [.fromMasterSeed(masterSeed, [password], [iota])](#module_ticApi.init.fromMasterSeed) ⇒ <code>Promise.&lt;TICClient&gt;</code>
    * [.fromMam(masterClient, [password])](#module_ticApi.init.fromMam) ⇒ <code>Promise.&lt;TICClient&gt;</code>
    * [.fromSeeds(seeds, masterClient)](#module_ticApi.init.fromSeeds) ⇒ <code>Promise.&lt;TICClient&gt;</code>

<a name="module_ticApi.init.fromMasterSeed"></a>

#### init.fromMasterSeed(masterSeed, [password], [iota]) ⇒ <code>Promise.&lt;TICClient&gt;</code>
Initializes a [module:types.TICClient](module:types.TICClient) from a masterSeed by retrieving the channel seeds from the restricted MAM channel with the password.If the seeds are not stored in the restricted channel the channel MAMClients will be returned undefined.

**Kind**: static method of [<code>init</code>](#module_ticApi.init)  
**Returns**: <code>Promise.&lt;TICClient&gt;</code> - a Promise awaiting the initialized TICClient.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| masterSeed | <code>string</code> |  | The seed for the master channel. |
| [password] | <code>string</code> | <code>&quot;masterSeed&quot;</code> | the tryte-encoded password used      to save the seed of the profiles channels on the restricted master channel.       if it's null the seeds are not retrieved. |
| [iota] | <code>IotaClass</code> | <code>mamClient.getIota()</code> | The iota client for the MAM client. |

<a name="module_ticApi.init.fromMam"></a>

#### init.fromMam(masterClient, [password]) ⇒ <code>Promise.&lt;TICClient&gt;</code>
Initializes a [module:types.TICClient](module:types.TICClient) from a masterClient by retrieving the channel seeds      from the restricted MAM channel.If the seeds are not stored in the restricted channel the channel MAMClients      will be returned undefined.

**Kind**: static method of [<code>init</code>](#module_ticApi.init)  
**Returns**: <code>Promise.&lt;TICClient&gt;</code> - a Promise awaiting the initialized TICClient.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| masterClient | <code>MAMClient</code> |  | The MAMClient for the master channel. |
| [password] | <code>string</code> | <code>&quot;masterSeed&quot;</code> | the tryte-encoded password used      to save the seed of the profiles channels on the restricted master channel.       if it's null the seeds are not retrieved. |

<a name="module_ticApi.init.fromSeeds"></a>

#### init.fromSeeds(seeds, masterClient) ⇒ <code>Promise.&lt;TICClient&gt;</code>
Initializes a [module:types.TICClient](module:types.TICClient) from a masterClient and the channel seeds.If the seeds are not provided the channel MAMClients will be returned undefined.

**Kind**: static method of [<code>init</code>](#module_ticApi.init)  
**Returns**: <code>Promise.&lt;TICClient&gt;</code> - a Promise awaiting the initialized TICClient.  

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
    * [.putInfo(client, info)](#module_ticApi.profile.putInfo) ⇒ <code>Promise.&lt;string&gt;</code>
    * [.removeInfo(client, properties)](#module_ticApi.profile.removeInfo) ⇒ <code>Promise.&lt;string&gt;</code>
    * [.get(channelRoot, iota)](#module_ticApi.profile.get) ⇒ <code>Promise.&lt;Object&gt;</code>

<a name="module_ticApi.profile.putInfo"></a>

#### profile.putInfo(client, info) ⇒ <code>Promise.&lt;string&gt;</code>
Adds the provided info to the profile MAM channel.

**Kind**: static method of [<code>profile</code>](#module_ticApi.profile)  
**Returns**: <code>Promise.&lt;string&gt;</code> - a Promise awaiting the root address of the attached message.  

| Param | Type | Description |
| --- | --- | --- |
| client | <code>MAMClient</code> | the MAMClient of the profile channel. |
| info | <code>Object</code> | an Object containing contact informaton to be added to the profile. |

<a name="module_ticApi.profile.removeInfo"></a>

#### profile.removeInfo(client, properties) ⇒ <code>Promise.&lt;string&gt;</code>
Deletes the the specified info to the profile MAM channel.

**Kind**: static method of [<code>profile</code>](#module_ticApi.profile)  
**Returns**: <code>Promise.&lt;string&gt;</code> - a Promise awaiting the root address of the attached message.  

| Param | Type | Description |
| --- | --- | --- |
| client | <code>MAMClient</code> | the MAMClient of the profile channel. |
| properties | <code>Array.&lt;string&gt;</code> | an array of strings containing       contact informaton properties to be deleted from the profile. |

<a name="module_ticApi.profile.get"></a>

#### profile.get(channelRoot, iota) ⇒ <code>Promise.&lt;Object&gt;</code>
Reads the contents of the profile MAM channel.

**Kind**: static method of [<code>profile</code>](#module_ticApi.profile)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - a Promise awaiting the compiled content of the profile MAM channel.  

| Param | Type | Description |
| --- | --- | --- |
| channelRoot | <code>string</code> | the root address of the profile channel. |
| iota | <code>IotaClass</code> | The iota client for the MAM client. |

<a name="module_ticApi.contacts"></a>

### tic.contacts
used to modify your list of contacts or get the one from others.

**Kind**: static property of [<code>ticApi</code>](#module_ticApi)  

* [.contacts](#module_ticApi.contacts)
    * [.trust(client, contacts)](#module_ticApi.contacts.trust) ⇒ <code>Promise.&lt;string&gt;</code>
    * [.distrust(client, contacts)](#module_ticApi.contacts.distrust) ⇒ <code>Promise.&lt;string&gt;</code>
    * [.get(contactsRoot, iota)](#module_ticApi.contacts.get) ⇒ <code>Promise.&lt;Array&gt;</code>

<a name="module_ticApi.contacts.trust"></a>

#### contacts.trust(client, contacts) ⇒ <code>Promise.&lt;string&gt;</code>
Adds the provided contacts to the trusted contacts in the contacts MAM channel.

**Kind**: static method of [<code>contacts</code>](#module_ticApi.contacts)  
**Returns**: <code>Promise.&lt;string&gt;</code> - a Promise awaiting the root address of the attached message.  

| Param | Type | Description |
| --- | --- | --- |
| client | <code>MAMClient</code> | the MAMClient of the contacts channel. |
| contacts | <code>Array.&lt;string&gt;</code> | the master channel roots of the       contacts to be added to the trusted contacts. |

<a name="module_ticApi.contacts.distrust"></a>

#### contacts.distrust(client, contacts) ⇒ <code>Promise.&lt;string&gt;</code>
Adds the provided contacts to the distrusted contacts in the contacts MAM channel.

**Kind**: static method of [<code>contacts</code>](#module_ticApi.contacts)  
**Returns**: <code>Promise.&lt;string&gt;</code> - a Promise awaiting the root address of the attached message.  

| Param | Type | Description |
| --- | --- | --- |
| client | <code>MAMClient</code> | the MAMClient of the contacts channel. |
| contacts | <code>Array.&lt;string&gt;</code> | the master channel roots of the contacts       to be added to the distrusted contacts. |

<a name="module_ticApi.contacts.get"></a>

#### contacts.get(contactsRoot, iota) ⇒ <code>Promise.&lt;Array&gt;</code>
Reads the contents of the contacts MAM channel.

**Kind**: static method of [<code>contacts</code>](#module_ticApi.contacts)  
**Returns**: <code>Promise.&lt;Array&gt;</code> - a Promise awaiting an array of master channel      roots of the contacts assigned to "trust" or "distrust" compiled from the MAM channel.  

| Param | Type | Description |
| --- | --- | --- |
| contactsRoot | <code>string</code> | the root address of the contacts channel. |
| iota | <code>IotaClass</code> | The iota client for the MAM client. |

<a name="module_ticApi.rating"></a>

### tic.rating
used to get the rating of another tic account.

**Kind**: static property of [<code>ticApi</code>](#module_ticApi)  

* [.rating](#module_ticApi.rating)
    * [.fromMasterChannelRoot(sourceMasterChannelRoot, targetMasterChannelRoot, iota, [depth])](#module_ticApi.rating.fromMasterChannelRoot) ⇒ <code>Promise.&lt;RatingSearchResult&gt;</code>
    * [.fromMasterClient(masterClient, targetMasterChannelRoot, [depth])](#module_ticApi.rating.fromMasterClient) ⇒ <code>Promise.&lt;RatingSearchResult&gt;</code>
    * [.fromTIC(tic, targetMasterChannelRoot, [depth])](#module_ticApi.rating.fromTIC) ⇒ <code>Promise.&lt;RatingSearchResult&gt;</code>

<a name="module_ticApi.rating.fromMasterChannelRoot"></a>

#### rating.fromMasterChannelRoot(sourceMasterChannelRoot, targetMasterChannelRoot, iota, [depth]) ⇒ <code>Promise.&lt;RatingSearchResult&gt;</code>
Computes the [module:types.RatingSearchResult](module:types.RatingSearchResult) of a given profile by taking all contacts of the source and their contacts recursivly for a given max amount of steps (depth) and summing their stored trust and distrust messages.

**Kind**: static method of [<code>rating</code>](#module_ticApi.rating)  
**Returns**: <code>Promise.&lt;RatingSearchResult&gt;</code> - a Promise awaiting the RatingSearchResult of the target.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| sourceMasterChannelRoot | <code>string</code> |  | the source's root address of the masterChannel. |
| targetMasterChannelRoot | <code>string</code> |  | the channel root adress of the master channel of the target. |
| iota | <code>IotaClass</code> |  | an initialized iota client. |
| [depth] | <code>number</code> | <code>5</code> | the amount of steps to get the contacts of the source's contacts. |

<a name="module_ticApi.rating.fromMasterClient"></a>

#### rating.fromMasterClient(masterClient, targetMasterChannelRoot, [depth]) ⇒ <code>Promise.&lt;RatingSearchResult&gt;</code>
Computes the [module:types.RatingSearchResult](module:types.RatingSearchResult) of a given profile by taking all contacts of the source and their contacts recursivly for a given max amount of steps (depth) and summing their stored trust and distrust messages.

**Kind**: static method of [<code>rating</code>](#module_ticApi.rating)  
**Returns**: <code>Promise.&lt;RatingSearchResult&gt;</code> - a Promise awaiting the RatingSearchResult of the target.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| masterClient | <code>MAMClient</code> |  | the source's initialized MAMClient for the master channel. |
| targetMasterChannelRoot | <code>string</code> |  | the channel root adress of the master channel of the target. |
| [depth] | <code>number</code> | <code>5</code> | the amount of steps to get the contacts of the source's contacts. |

<a name="module_ticApi.rating.fromTIC"></a>

#### rating.fromTIC(tic, targetMasterChannelRoot, [depth]) ⇒ <code>Promise.&lt;RatingSearchResult&gt;</code>
Computes the [module:types.RatingSearchResult](module:types.RatingSearchResult) of a given profile by taking all contacts of the source and their contacts recursivly for a given max amount of steps (depth) and summing their stored trust and distrust messages.

**Kind**: static method of [<code>rating</code>](#module_ticApi.rating)  
**Returns**: <code>Promise.&lt;RatingSearchResult&gt;</code> - a Promise awaiting the RatingSearchResult of the target.  

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
| depth | <code>Number</code> | the highest layer of the graph, created by a [module:types.RatingSearchResult](module:types.RatingSearchResult), where the contact exists. |
| rating | <code>string</code> | the rating (trust, distrust or unknown) that the contact gave the target of a [module:types.RatingSearchResult](module:types.RatingSearchResult) |

<a name="module_types..Rating"></a>

### types~Rating : <code>Object</code>
An Object consisting of numbers representing the amounts of contacts rating a specific account 'trusted', 'distrusted' or 'unknown'. These numbers can be computed by specific measures (see [module:types.RatingSearchResult](module:types.RatingSearchResult)).

**Kind**: inner typedef of [<code>types</code>](#module_types)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| trust | <code>number</code> | a number representing the amount of contacts rating a given account trustworthy. |
| distrust | <code>number</code> | a number representing the amount of contacts rating a given account not trustworthy. |
| unknown | <code>number</code> | a number representing the amount of contacts not rating a given a account. |

<a name="module_types..RatingSearchResult"></a>

### types~RatingSearchResult : <code>Object</code>
An object containing both the [module:types.Rating](module:types.Rating) for a given contact computed by multiple measures and the  [module:types.Contact](module:types.Contact)s visitedrecursivly in the search to derive it.

**Kind**: inner typedef of [<code>types</code>](#module_types)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| graph | <code>Contact</code> | The paths of the rating searches source account to the [module:types.Contact](module:types.Contact)s,  created while computing the rating for a given account, in form of a graph with a single root. The root is the account  from where the search started (source account). The graph may contain cycles, so printing it may cause infinite loops.  The children of a node in the graph are the accounts that are trusted by the contacts and the target of the rating search,  even if they declared it as distrusting. |
| contacts | <code>Object</code> | An object containg all visited contacts. The keys are  the master channel roots of the contacts. Their values are the [module:types.Contact](module:types.Contact)s themself. A contact is only visited  if it's trusted. Additionally this property includes the target of the RatingSearch as a [module:types.Contact](module:types.Contact). |
| visited | <code>Array.&lt;Contact&gt;</code> | an array containing all visited [module:types.Contact](module:types.Contact)s and  the target. |
| rating | <code>Object</code> | An object containing [module:types.Rating](module:types.Rating)s derived with different measures. |
| rating.flat | <code>Rating</code> | a [module:types.Rating](module:types.Rating) computed by considering all visited contacts equally. |
| rating.weighted | <code>Rating</code> | A [module:types.Rating](module:types.Rating) where the value of a rating is  weighted by the lowest depth where it was found in the graph. the root has depth 0. The rating is weighted by  'rating / (depth + 1)'. |
| rating.perLevel | <code>Array.&lt;Rating&gt;</code> | An array of [module:types.Rating](module:types.Rating)s, one for each layer of the graph. The nth element in the array contains the rating of all contacts at depth n. |


* * *

&copy; 2018 Robin Lamberti \<lamberti.robin@gmail.com\>. Documented by [jsdoc-to-markdown](https://github.com/jsdoc2md/jsdoc-to-markdown).
