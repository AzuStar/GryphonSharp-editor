import * as fs from 'fs';

export class Page {

    private HTML: string;
    public MappedPlaceholders: string[] = [];

    constructor(pagePath: string) {
        this.HTML = fs.readFileSync(pagePath, 'utf-8');
        this.FindNewMatches();
    }

    private FindNewMatches() {
        const matches = this.HTML.match("\${(\w+)}");
        if (matches !== null) {
            matches.forEach(element => {
                if (!this.MappedPlaceholders.includes(element)) {
                    this.MappedPlaceholders.push(element);
                }
            });
        }
    }

    public Replace(placeholder: string, value: string) {
        if (this.MappedPlaceholders.includes(placeholder)) {
            this.HTML.replace('${' + placeholder + '}', value);
            const index = this.MappedPlaceholders.indexOf(placeholder, 0);
            if (index > -1) {
                this.MappedPlaceholders.splice(index, 1);
            }
            this.FindNewMatches();
        } else {
            throw new Error('Document does not contain definition of ' + placeholder);
        }
    }

    public FillReplace(placeholder: string, values: string[]) {
        if (values.length !== 0) {
            for (let i = 0; i < values.length - 1; i++) {
                this.Replace(placeholder, values[i] + '\n${' + placeholder + '}');
            }
            this.Replace(placeholder, values[values.length - 1]);
        }else{
            this.Replace(placeholder, '');
        }
    }

    public GetCompiledHTML(): string {
        if (this.MappedPlaceholders.length > 0) {
            throw new Error('Values remain unreplaced: ' + Map.length);
        }
        else {
            return this.HTML;
        }
    }

}