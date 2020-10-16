var test = require('tape')
var endent = require('./')

test('object', t => {
  t.plan(1)

  var json = JSON.stringify(JSON.parse('[ "abc" ]'), null, 2)

  var someobj = {
    contact: {
      jack: '123456',
      tom: '654321'
    },
    name: 'template',
    color: 'blue',
    animals: ['bear', 'fish', 'dog', 'cat']
  }

  var colors = ['red', 'pink', 'white']
  var objectName = 'someobj'

  var dependencies = ['jquery', 'underscore', 'bootstrap']
  var dependencyTmpl = ``

  dependencies.forEach((d, i) => {
    dependencyTmpl += `var ${d} = require("${d}")\n`
  })

  var jsFile = endent`
    ${dependencyTmpl}
    module.exports = store

    function store (state, emitter) {
      emitter.on("DOMContentLoaded", function () {
        state["json"] = ${json}
        state["${objectName}"] = ${endent.pretty(someobj)}
        state["colors"] = ${endent.pretty(colors)}
        state["name"] = "${endent.pretty('jack')}"
        state["name2"] = "${'tom'}"
        state["number"] = ${endent.pretty(123)}
        state["number2"] = ${123}
        state["Iamundefined"] = ${endent.pretty()}
        state["Iamnull"] = ${endent.pretty(null)}
        state["Iamregexp"] = ${endent.pretty(/abc/)}
      })
    }
  `

  t.equal(jsFile, `var jquery = require("jquery")
var underscore = require("underscore")
var bootstrap = require("bootstrap")

module.exports = store

function store (state, emitter) {
  emitter.on("DOMContentLoaded", function () {
    state["json"] = [
      "abc"
    ]
    state["someobj"] = {
      "contact": {
        "jack": "123456",
        "tom": "654321"
      },
      "name": "template",
      "color": "blue",
      "animals": [
        "bear",
        "fish",
        "dog",
        "cat"
      ]
    }
    state["colors"] = [
      "red",
      "pink",
      "white"
    ]
    state["name"] = "jack"
    state["name2"] = "tom"
    state["number"] = 123
    state["number2"] = 123
    state["Iamundefined"] = undefined
    state["Iamnull"] = null
    state["Iamregexp"] = /abc/
  })
}`)
})

test('string', t => {
  t.plan(1)
  const a = `
hello
  world`
  const b = endent`
    foo.
    ${a}
    bar.`
  t.equal(b, `foo.

hello
  world
bar.`)
})

test('issue#1', t => {
  t.plan(1)
  const a = '"test"'
  const r = endent`
    {
      ${a}: null
    }
  `
  t.equal(r, `{
  "test": null
}`)
})

test('issue#2', t => {
  t.plan(1)

  const r = endent`
    foo.
    x=${'hello\n  world'}
    bar.
  `
  console.log(r)
  t.equal(r, `foo.
x=hello
  world
bar.`)
})

test('tab', t => {
  t.plan(1)
  t.equal(endent`foo\tbar`, 'foo\tbar')
})
