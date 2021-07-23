import * as fs from 'fs';
import path from 'path';

// singleton recursive pattern
class RecursiveDependencyOrder {
    private static lockedScripts: string[] = [];

    public static incrementDependencies(script: string) {
        this.lockedScripts = [];
        this.recursiveIncrement(script);
        // gacky, but idea is that root should not be incremented
        jsscripts[script][1] -= 1;
    }

    private static recursiveIncrement(script: string) {
        if (!(this.lockedScripts.includes(script))) {
            this.lockedScripts.push(script);
             //higher priority means script has to be higher for everything to be understood
            jsscripts[script][1] += 1;
            for (const scri of jsscripts[script][0])
                this.recursiveIncrement(scri);
        }
        else console.error("Recursive depedency of itself in " + script);
    }
}

const scriptsPath = path.join("out", "editor");
const scriptSources = path.join("src", "editor");

//#region Regex-es
const pars_ignore = /^\/\/! *pars-ignore\n[^\n]+$/gm;
const remove_exports = /^export /gm;
const remove_imports = /^import .+ from (?:'|")(\w+)(?:'|");$/gm;

//#endregion


var editorScripts = fs.readdirSync(scriptsPath);
var editorScriptsSources = fs.readdirSync(scriptSources);

editorScriptsSources = editorScriptsSources.map(element => { return element.slice(0, -3)+".js"; });

editorScripts = editorScripts.filter( ( el ) => editorScriptsSources.includes( el ) );

var bundle: string = "";

var jsscripts: { [id: string]: [Array<string>, number, string] } = {};

// set up dictionary
editorScripts.forEach(element => {
    if (element.split('.').pop() == 'js') {
        jsscripts[element] = [[], 0, fs.readFileSync(path.join(scriptsPath, element), 'utf-8')];
    }
});

for (const key in jsscripts) {
    var content: string = jsscripts[key][2];
    // removes pars-ignore line and 1 line below
    content = content.replace(pars_ignore, "");
    // drops all exports from js files
    // for now only handles ts-compiled files
    content = content.replace(remove_exports, "");
    // find all imports and reconstruct them in order of access
    var imports = content.matchAll(remove_imports);
    for (const match of imports) {
        var file = match[1] + ".js";
        if (file in jsscripts)
            jsscripts[key][0].push(file);
    }
    // also remove imports
    content = content.replace(remove_imports, "");
    jsscripts[key][2] = content;
}

// compute dependency order
for (const key in jsscripts) {
    RecursiveDependencyOrder.incrementDependencies(key);
}

// order sort the dicc
var sortedScripts: [number, string][] = [];
for (const key in jsscripts) {
    sortedScripts.push([jsscripts[key][1], jsscripts[key][2]]);
}

sortedScripts = sortedScripts.sort((obj1, obj2) => {
    return obj2[0] - obj1[0];
});

//bundle the bundle
for (const context of sortedScripts) {
    bundle += "\n\n"+context[1];
}


fs.writeFile(path.join('webStatic', 'js', 'editor.js'), bundle, () => {});