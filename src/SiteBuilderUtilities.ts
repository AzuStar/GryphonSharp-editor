import * as fs from 'fs';

export class Page {

    private HTML: string;
    public MappedPlaceholders: string[] = [];

    constructor(pagePath: string) {
        this.HTML = fs.readFileSync(pagePath, 'utf-8');
        this.FindNewMatches();
    }

    private FindNewMatches() {
        const matches = this.HTML.match(/\${(\w+)}/g);
        if (matches !== null) {
            matches.forEach(element => {
                if (!this.MappedPlaceholders.includes(element)) {
                    this.MappedPlaceholders.push(element);
                }
            });
        }
    }

    public Replace(placeholder: string, value: string) {
        const ph = '${' + placeholder + '}';
        if (this.MappedPlaceholders.includes(ph)) {
            this.HTML = this.HTML.split(ph).join(value);
            const index = this.MappedPlaceholders.indexOf(ph);
            if (index > -1) {
                this.MappedPlaceholders.splice(index, 1);
            }
            this.FindNewMatches();
        } else {
            console.error('Document does not contain definition of ' + placeholder);
        }
    }

    public FillReplace(placeholder: string, values: string[]) {
        const ph = '${' + placeholder + '}';
        if (values.length !== 0) {
            for (let i = 0; i < values.length - 1; i++) {
                this.Replace(placeholder, values[i] + '\n' + ph);
            }
            this.Replace(placeholder, values[values.length - 1]);
        } else {
            this.HTML = this.HTML.replace(ph, '');
        }
    }

    public GetCompiledHTML(): string {
        console.log('Values remain unreplaced: ' + this.MappedPlaceholders.length);
        return this.HTML;
    }

}