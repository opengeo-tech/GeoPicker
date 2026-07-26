/**
 * lodash only dependency replacement for old npm: @stefcud/configyml
 */
const fs = require('fs')
const yaml = require('js-yaml')
const Ajv = require('ajv')
const S = require('fluent-json-schema')
const timestamp = new Date().toISOString()

function validateConfig(config, schemaPath) {
    const configSchema = require(schemaPath)(S)
    const validate = new Ajv({ allErrors: true }).compile(configSchema.valueOf())

    if (validate(config)) return

    const details = validate.errors
        .map(e => `${e.instancePath || '(root)'} ${e.message}`)
        .join('; ')

    throw new Error(`Invalid config.yml: ${details}`)
}

function isPlainObject(val) {
    if (val === null || typeof val !== 'object') return false
    const proto = Object.getPrototypeOf(val)
    return proto === Object.prototype || proto === null
}
function isString(val) {
    return typeof val === 'string'
}
function mapValues(obj, fn) {
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, fn(v, k)]))
}
function getPath(obj, path) {
    return String(path).split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj)
}
function hasPath(obj, path) {
    return getPath(obj, path) !== undefined
}
function merge(a, b) {
    return {
        ...a,
        ...Object.fromEntries(
            Object.entries(b).map(([k, v]) => [
                k,
                isPlainObject(v) && isPlainObject(a[k])
                    ? merge(a[k], v)
                    : v
            ])
        )
    };
}
let multiFile = false
let envId
let ENVID
let isDev
let environmentType
let environmentTypes
let environments
let config
let defaultsEnvVars = {}
const processEnv = {
    NODE_ENV: 'prod'
}

function load(opts) {
    let env, basepath, configfile

    if (isPlainObject(opts)) {
        ;({ env, basepath, configfile, defaultsEnvVars } = opts)
    }

    Object.assign(processEnv, defaultsEnvVars, process.env)

    config = loadConfig(basepath, configfile)
    environments = config.environments || { default: 'prod' }
    envId = getEnvId(env)
    ENVID = envId.toUpperCase()
    isDev = ['DEV', 'DEVELOP', 'DEVELOPMENT'].includes(ENVID)
    environmentTypes = environments.static || Object.keys(config)
    environmentType = environmentTypes.includes(envId)
        ? envId
        : environments.default
    config = swapVariables(config)

    return config
}

function loadConfigFile(file) {
    try {
        const text = fs.readFileSync(file, 'utf8')
        const subbed = substitute(processEnv, text)
        return yaml.load(subbed.replace)
    } catch (e) {
        if (!/ENOENT:\s+no such file or directory/.test(e)) {
            console.log('Error Loading ' + file + ':', e)
            throw e
        }
    }
}

function loadConfig(basepath = '.', configfile = 'config.yml') {
    if (fs.existsSync(`${basepath}/${configfile}`)) {
        return loadConfigFile(`${basepath}/${configfile}`)
    } else if (fs.existsSync(`${basepath}/config`)) {
        const tmpl = {}
        multiFile = true
        const files = fs.readdirSync(`${basepath}/config`)
        for (let i = 0; i < files.length; i++) {
            if (files[i].endsWith('.yml')) {
                const keyName = files[i].substring(
                    0,
                    files[i].length - '.yml'.length
                )
                tmpl[keyName] = loadConfigFile(`${basepath}/config/` + files[i])
            }
        }
        return tmpl
    } else {
        console.log(`Not found config in path: ${basepath}`)
        throw new Error(`Not found config in path: ${basepath}`)
    }
}

function getEnvId(env) {
    return env || processEnv.NODE_ENV
}

function substitute(file, p) {
    const wholeMatch = /^\${([\w.-]+)}$/.exec(p)
    if (wholeMatch) {
        const term = wholeMatch[1]
        if (hasPath(file, term)) {
            return { success: true, replace: getPath(file, term) }
        }
        if (hasPath(file.defaultsEnvVars, term)) {
            return { success: true, replace: getPath(file.defaultsEnvVars, term) }
        }
        return { success: false, replace: p }
    }

    let success = false
    const replaced = p.replace(/\${([\w.-]+)}/g, function (match, term) {
        if (hasPath(file, term)) {
            success = true
            return getPath(file, term)
        }
        if (hasPath(file.defaultsEnvVars, term)) {
            success = true
            return getPath(file.defaultsEnvVars, term)
        }
        return match
    })
    return { success, replace: replaced }
}

function transform(file, obj) {
    let changed = false

    const resultant = mapValues(obj, function (p) {
        if (isPlainObject(p)) {
            const transformed = transform(file, p)
            if (!changed && transformed.changed) {
                changed = true
            }
            return transformed.result
        }

        if (isString(p)) {
            const subbed = substitute(file, p)
            if (!changed && subbed.success) {
                changed = true
            }
            return subbed.replace
        }

        if (Array.isArray(p)) {
            for (let i = 0; i < p.length; i++) {
                if (isString(p[i])) {
                    p[i] = substitute(file, p[i]).replace
                }
            }
        }

        return p
    })
    return { changed, result: resultant }
}

function swapVariables(configFile) {
    function readAndSwap(obj) {
        let altered = false
        do {
            const tmp = transform(obj, obj)
            obj = tmp.result
            altered = tmp.changed
        } while (altered)
        return obj
    }

    let file = multiFile ? mapValues(configFile, readAndSwap) : configFile
    file = merge(merge(file || {}, file[environmentType] || {}), {
        envId,
        ENVID,
        isDev,
        timestamp
    })

    return readAndSwap(file)
}
module.exports = function (opts) {
    return load(opts)
}
module.exports.load = load
module.exports.validateConfig = validateConfig