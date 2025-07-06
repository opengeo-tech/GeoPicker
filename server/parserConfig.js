/**
 * lodash only dependency replacement for old npm: @stefcud/configyml
 */
const flow = require('lodash/fp/flow')
const head = require('lodash/fp/head')
const pick = require('lodash/fp/pick')
const keys = require('lodash/fp/keys')
const mapValues = require('lodash/mapValues')
const merge = require('lodash/merge')
const isPlainObject = require('lodash/isPlainObject')
const isString = require('lodash/isString')
const has = require('lodash/has')
const get = require('lodash/get')

const fs = require('fs')
const yaml = require('js-yaml')
const args = require('yargs').argv
const timestamp = new Date().toISOString()
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
    envId = getEnvId(config, env)
    ENVID = envId.toUpperCase()
    isDev = ['DEV', 'DEVELOP', 'DEVELOPMENT'].includes(ENVID)
    environmentTypes = environments.static || keys(config)
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

function getEnvId(obj, env) {
    return (
        env ||
        args.env ||
        flow(pick(keys(obj)), keys, head)(args) ||
        processEnv.NODE_ENV
    )
}

function substitute(file, p) {
    let success = false
    const replaced = p.replace(/\${([\w.-]+)}/g, function (match, term) {
        if (!success) {
            success = has(file, term)
        }
        return get(file, term) || get(file.defaultsEnvVars, term) || match
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

function log() {
    console.log('CONFIG:', envId || '-', environmentType || '-')
}

function requireSettings(settings) {
    const erredSettings = []
    settings = isString(settings) ? [settings] : settings
    settings.forEach(function (setting) {
        if (!has(config, setting)) {
            erredSettings.push(setting)
        }
    });

    if (erredSettings.length > 1) {
        throw new Error(
            'The following settings are required in config yml file: ' +
                erredSettings.join('; ')
        )
    }

    if (erredSettings.length === 1) {
        throw new Error(erredSettings[0] + ' is required in config yml file')
    }
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
    file = merge({}, file || {}, file[environmentType] || {}, {
        envId,
        ENVID,
        isDev,
        timestamp
    })

    /* unuseful replaced in loadConfigFile  const enved = transform(process.env, file).result;
  file = readAndSwap(enved)
  return file */
    return readAndSwap(file)
}
module.exports = function (opts) {
    return load(opts)
}
module.exports.load = load
module.exports.log = log
module.exports.require = requireSettings
