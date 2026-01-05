import {map,snakeCase} from 'lodash'
const modules = {
    ...import.meta.glob("/src/views/**/**.vue"),
    ...import.meta.glob("/src/views/**/config.js"),
    ...import.meta.glob("../views/model/**.vue"),
}
console.debug('vite_import', modules)
const _import = file => {
    let f = file.replaceAll('//', '/')
    let m = modules[f]
    if(!m) {
        return
    }
    console.debug(`using modual: ${m}`)
    return m
}

export const autoViews = () => {
    let vs = import.meta.glob("/src/views/**/**.vue")
    return map(vs, (v, k) => {
        let p = k.replace('/src/views/','/').replace('.vue', '')
        p = snakeCase(p)
        return {path: p, component: v}
    })
}

export const view = path => {
    let ps = (typeof path === 'string')?[path]:path
    for(let p of ps) {
        let m = _import(`/src/views/${p}.vue`)
        if(m){
            return m
        }
    }
}
export default {
    _import,
    view,
    autoViews
}
