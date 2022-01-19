

export const IGNORE_FIELDS = new Map<string, string[]>();
export function JsonIgnore(cls: any, name: string) {
    let clsName = cls.constructor.name;
    let list: string[];

    if (IGNORE_FIELDS.has(clsName)) {
        //@ts-ignore
        list = IGNORE_FIELDS.get(clsName);
    } else {
        list = [];
        IGNORE_FIELDS.set(clsName, list);
    }

    list.push(name);
}

export class JSONData {
    toJson(): { [name: string]: any } {
        let json = {};
        let ignore = IGNORE_FIELDS.get(this.constructor.name);
        //@ts-ignore
        Object.getOwnPropertyNames(this).filter(name => ignore.indexOf(name) < 0).forEach(name => {
            json[name] = this[name];
        });

        return json;
    }
}
