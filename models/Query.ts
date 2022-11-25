import { Root } from "./Common";

export interface IQuery {
  bool?: IBool;
  from?: number;
  size?: number;
}

export interface IBool {
  must?: IMust[];
  filter?: IFilter[];
  should?: IFilter[];
}

export interface IMust {
  multi_match?: IMultiMatch;
}

export interface IMultiMatch {
  query: string;
  fields: string[];
}

export interface IFilter {
  term?: ITerm;
  range?: IRange;
}

export interface ITerm {
  "genre.keyword"?: string;
  year?: number;
  "languages.keyword"?: string;
  countries?: string;
}

export interface IRange {
  runtime?: IRuntime;
  users_rating?: IUsersRating;
}

interface IRawRange {
  gte?: number | undefined;
  lte?: number | undefined;
}

export interface IRuntime extends IRawRange { }

export interface IUsersRating extends IRawRange { }

class MultiMatch extends Root implements IMultiMatch {
    public query: string;
    public fields: string[];

    constructor(data: IMultiMatch) {
        super();

        this.query = data.query || "";
        this.fields = data.fields || []
    }
}

class RawRange extends Root implements IRawRange {
    public gte?: number | undefined;
    public lte?: number | undefined;

    constructor(data: IRawRange) {
        super();

        if(data.gte) {
            this.gte = data.gte;
        }

        if(data.lte) {
            this.lte = data.lte;
        }
    }
}

class Runtime extends RawRange implements IRuntime {
    constructor(data: IRawRange){
        super(data);
    }
}

class UserRating extends RawRange implements UserRating {
    constructor(data: IRawRange){
        super(data);
    }
}

class Must extends Root implements IMust {
    public multi_match?: IMultiMatch;

    constructor(data: IMust) {
        super();

        if(data?.multi_match) {
            this.multi_match = new MultiMatch(data.multi_match);
        } else {
            delete this.multi_match;
        }
    }
}

class Term extends Root implements ITerm {
    public "genre.keyword"?: any;
    public year?: number;
    public "languages.keyword"?: string;
    public countries?: string;

    constructor(data: ITerm) {
        super();

        if(data && data["genre.keyword"]) {
            this["genre.keyword"] = data["genre.keyword"];
        } else {
            delete this["genre.keyword"];
        }

        if(data && data.year) {
            this.year = data.year;
        } else {
            delete this.year;
        }

        if(data && data["languages.keyword"]) {
            this["languages.keyword"] = data["languages.keyword"];
        } else {
            delete this["languages.keyword"];
        }

        if(data && data.countries) {
            this.countries = data.countries;
        } else {
            delete this.countries;
        }
    }
}

class Range extends Root implements IRange {
    public runtime?: Runtime;
    public users_rating?: UserRating;

    constructor(data: IRange) {
        super();

        if(data.runtime) {
            this.runtime = new Runtime(data.runtime);
        } else {
            delete this.runtime;
        }

        if(data.users_rating) {
            this.users_rating = new UserRating(data.users_rating);
        } else {
            delete this.users_rating;
        }
    }

    public toJSON() {
        return {
            ...this,
            ...(this.runtime ? {runtime: this.runtime.toJSON()}: {}),
            ...(this.users_rating ? {users_rating: this.users_rating.toJSON()}: {}),
        }
    }
}

class Filter extends Root implements IFilter {
    public term?: Term;
    public range?: Range;

    constructor(data: IFilter) {
        super();

        if(data?.term) {
            this.term = new Term(data.term);
        } else {
            delete this.term;
        }

        if(data?.range) {
            this.range = new Range(data.range);
        } else {
            delete this.range;
        }
    }

    public toJSON() {
        return {
            ...this,
            ...(this.term ? {term: this.term.toJSON()}: {}),
            ...(this.range ? {range: this.range.toJSON()}: {}),
        }
    }
}

class Should extends Root implements IFilter {
    public term?: Term;
    public range?: Range;

    constructor(data: IFilter) {
        super();

        if(data?.term) {
            this.term = new Term(data.term);
        } else {
            delete this.term;
        }

        if(data?.range) {
            this.range = new Range(data.range);
        } else {
            delete this.range;
        }
    }

    public toJSON() {
        return {
            ...this,
            ...(this.term ? {term: this.term.toJSON()}: {}),
            ...(this.range ? {range: this.range.toJSON()}: {}),
        }
    }
}

class Bool extends Root implements IBool {
    public must?: Must[];
    public filter?: Filter[];
    public should?: Should[];

    constructor(data: IBool) {
        super();

        if(data?.must) {
            this.must = data?.must.map((m: any) => new Must(m));
        } else {
            delete this.must;
        }

        if(data?.filter) {
            this.filter = data?.filter.map((f: any) => new Filter(f));
        } else {
            delete this.filter;
        }

        if(data?.should) {
            this.should = data?.should.map((s: any) => new Should(s));
        } else {
            delete this.should;
        }
    }

    public toJSON() {
        return {
            ...this,
            ...(this.must ? {must: this.must.map(m => m.toJSON())}: {}),
            ...(this.filter ? {filter: this.filter.map(f => f.toJSON())}: {}),
            ...(this.should ? {should: this.should.map(s => s.toJSON())}: {}),
        }
    }
}

export class Query extends Root implements IQuery {
    public bool?: Bool;

    constructor(data: IQuery) {
        super();

        if(data.bool) {
            this.bool = new Bool(data.bool);
        } else {
            delete this.bool;
        }
    }

    public toJSON() {
        if(this.bool) {
            return {
                ...this,
                ...(this.bool ? {bool: this.bool.toJSON()}: {})
            }
        } else {
            return null;
        }
    }
}