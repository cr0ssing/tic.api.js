const expect = require('chai').expect;
const builder = require("../lib/chainMessageBuilder")

describe("message builder tests", () => {
    describe("iterative merge with put", () => {
        it("should merge nested objects from multiple messages", () => {
            const messages = [{put: {
                name: "Horst",
                numbers: {
                    mobile: 25,
                    home: 1
                }
            }}, {put: {
                name: "Horst S.",
                numbers: {
                    home: 2,
                    business: 100
                }
            }}]

            assert(messages, {
                name: "Horst S.",
                numbers: {
                    mobile: 25,
                    home: 2,
                    business: 100
                }
            })
        })

        it("should override value with object and keep other properties", () => {
            const messages = [{put: {
                name: "Horst S.",
                number: 3
            }}, {put: {
                name: {
                    first: "Horst",
                    sur: "S."
                }
            }}]
            assert(messages, {
                name: {
                    first: "Horst",
                    sur: "S."
                },
                number: 3
            })
        })

        it("should replace nested object with value and add new property", () => {
            const messages = [{put: {
                name: {
                    first: "Horst"
                },
                numbers: {
                    home: 3
                }
            }},{put: {
                name: "Horst",
                numbers: {
                    mobile: 4
                },
                address: "somewhere"
            }}]
            assert(messages, {
                name: "Horst",
                numbers: {
                    home: 3,
                    mobile: 4
                },
                address: "somewhere"
            })
        }) 
    });

    describe("iterative merge with put and delete", () => {
        it("should delete property", () => {
            const messages = [{
                put: {
                    name: "Horst",
                    number: 4
                }
            },{
                delete: ["number"]
            }]

            assert(messages, {
                name: "Horst"
            })
        })

        it("should delete nested property", () => {
            const messages = [{
                put: {
                    name: {
                        first: "Horst",
                        sur: "S."
                    },
                    number: 3
                }
            }, {
                delete: ["name.sur", "number"]
            }]

            assert(messages, {
                name: {
                    first: "Horst"
                }
            })
        })

        it("should delete nothing because unknown property", () => {
            const messages = [{
                put: {
                    name: "Horst S.",
                    numbers: {
                        home: 3
                    }
                }
            }, {
                delete: ["home"]
            }]

            assert(messages, {
                name: "Horst S.",
                numbers: {
                    home: 3
                }
            })
        })

        it("should delete nothing because empty path", () => {
            const messages = [{
                put: {
                    name: "Horst S.",
                    numbers: {
                        home: 3
                    }
                }
            }, {
                delete: [""]
            }]

            assert(messages, {
                name: "Horst S.",
                numbers: {
                    home: 3
                }
            })
        })

        it("should delete only property in object", () => {
            const messages = [{
                put: {
                    name: {
                        first: "Horst S",
                        last: "S."
                    }
                }
            }, {
                delete: ["name"]
            }]

            assert(messages, {})
        })
    })

    describe("iterative array build", () => {
        it("should build array fron multiple messages", () => {
            const messages = [{
                add: "A"
            }, {
                add: "B"
            }]
            
            assertArray(messages, ["A", "B"])
        })

        it("should build array fron messages with delete", () => {
            const messages = [{
                add: "A"
            }, {
                add: "B"
            }, {
                add: "C"
            }, {
                remove: "B"
            }]
            
            assertArray(messages, ["A", "C"])
            messages.push({remove: "C"})
            assertArray(messages, ["A"])
            messages.push({remove: "C"})
            assertArray(messages, ["A"])
            messages.push({remove: "A"})
            assertArray(messages, [])
            messages.push({remove: "C"})
            assertArray(messages, [])
            messages.push({add: "C"})
            assertArray(messages, ["C"])
        })

        it("should build array from messages with adding arrays", () => {
            const messages = [{
                add: "A"
            }, {
                add: ["B", "C"]
            }, {
                remove: "B"
            }, {
                add: ["F", "G"]
            }, {
                remove: "F"
            }]

            assertArray(messages, ["A", "C", "G"])
        })
    })

    describe("iterative array build with unique values", () => {
        it("should build array from multiple trustings and distrustings", () => {
            const messages = [{
                trust: ["A", "B", "E"]
            },{
                distrust: ["B", "C", "H"]
            }, {
                trust: ["A", "D", "I"]
            }]

            assertUniqueArray(messages, [{
                E: "trust"
            }, {
                "B": "distrust"
            }, {
                "C": "distrust"
            }, {
                "H": "distrust"
            }, {
                "A": "trust"
            }, {
                "D": "trust"
            }, {
                "I": "trust"
            }])
        })
    })
})

const assertUniqueArray = (messages, expected) => {
    const values = builder.buildUniqueArray(messages, ["distrust", "trust"])
    console.log("Result:", JSON.stringify(values))
    expect(values).to.have.deep.members(expected)
}

const assertArray = (messages, expected) => {
    const contacts = builder.buildArray(messages)
    console.log("Result:", JSON.stringify(contacts))
    expect(contacts).to.have.deep.members(expected)
}

const assert = (messages, expected) => {
    const profile = builder.build(messages)
    console.log("Result:", JSON.stringify(profile))
    expect(profile).to.deep.equal(expected)
}