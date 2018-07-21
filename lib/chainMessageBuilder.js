const extend = require('extend');

const build = (messages, put = "put", del = "delete") => {
    let result = {}
    messages.forEach(m => {
        if (m[del]) {
            m[del].forEach(path => deletePropertyPath(result, path))
        } else if (m[put]) {
            extend(true, result, m[put])
        }
    })
    return result
};

const buildArray = (messages, add = "add", remove = "remove") => {
    let result = []
    messages.forEach(m => {
        if (m[add]) {
            array(m[add]).forEach(i => result.push(i))
        } else if (m[remove]) {
            array(m[remove]).forEach(i => {
                const index = result.indexOf(i)
                if (index != -1) {
                    result.splice(index, 1)
                }
            })
        }
    })
    return result.filter(onlyUnique)
};

const buildUniqueArray = (messages, usedProperties) => {
    let keys = {}
    const keyOrder = []
    messages.forEach(m => {
        for (p of usedProperties) {
            if (m[p]) {
                const a = array(m[p])
                a.forEach(v => {
                    keys[v] = p
                    keyOrder.push(v)
                })
                break;
            } 
        }
    })
    return keyOrder.reverse().filter(onlyUnique).reverse().map(key => ({[key]: keys[key]}))
};

const onlyUnique = (value, index, self) => { 
    return self.indexOf(value) === index;
};

const array = (obj) => Array.isArray(obj) ? obj : [obj]

const deletePropertyPath = (obj, path) => {
    path = path.split('.');
  
    for (var i = 0; i < path.length - 1; i++) {
        obj = obj[path[i]];
  
        if (typeof obj === 'undefined') {
            return;
        }
    }
  
    delete obj[path.pop()];
};

module.exports = {
    build: build,
    buildArray: buildArray,
    buildUniqueArray: buildUniqueArray
}