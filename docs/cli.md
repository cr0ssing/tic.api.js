# CLI
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

## Setting Node
The option <code>--provider</code> must be set in all commands. It should be set to the URL of an IOTA full node supporting POW.

* Commands:
    * [create](#create)
    * [read](#read)
    * [putInfo](#putinfo)
    * [removeInfo](#removeinfo)
    * [trust](#trust)
    * [distrust](#distrust)
    * [rating](#rating)

<a name="#create"></a>

### create    
Creates a new TIC account by generating a profile and a contacts channel and saving its channel roots on the tangle.

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| seed | <code>string</code> |  | The seed of the TIC account to create. It's used to create the public master channel of the account where the channel roots of the profile and contacts channel are published. |
| password | <code>string</code> | seed | The tryte-encoded password to save the seeds of profile and contacts channel in the restricted channel of the TIC account. If password is not given the seed is used as a default. If null is given the seeds aren't saved. If the seeds are not saved you need to remember these by yourself and pass them as params in certain requests. |

**Example**  
```sh
$ ticCli-linux-x86 create --seed=THISISTHESEEDOFTHETICACCOUNTANDISHOULDNOTGIVEITTOANYBODYELSE --provider=https://your.favorite.node
```

<a name="#read"></a>

### read        
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

<a name="#putinfo"></a>

### putInfo     
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

<a name="#removeinfo"></a>

### removeInfo  
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

<a name="#trust"></a>

### trust       
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

<a name="#distrust"></a>

### distrust    
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

<a name="#rating"></a>

### rating      
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

&copy; 2018 Robin Lamberti \<lamberti.robin@gmail.com\>.