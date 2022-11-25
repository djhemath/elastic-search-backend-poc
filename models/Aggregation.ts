import { Root } from "./Common";

export interface IHistogram {
  field: string;
  interval: number;
  min_doc_count?: number;
}

export interface ITerms {
  field: string;
  size?: number;
}

export interface IAggregation {
  by_rating?: IByRating;
  by_country?: IByCountry;
  by_language?: IByLanguage;
  by_year?: IByYear;
  by_genre?: IByGenre;
  by_duration?: IByDuration;
}

export interface IByRating {
  histogram: IHistogram;
}

export interface IByCountry {
  terms: ITerms;
}

export interface IByLanguage {
  terms: ITerms;
}

export interface IByYear {
  histogram: IHistogram;
}

export interface IByGenre {
  terms: ITerms;
}

export interface IByDuration {
  histogram: IHistogram;
}

class Histogram extends Root implements IHistogram {
  public field: string;
  public interval: number;
  public min_doc_count: number;

  constructor(data: IHistogram) {
    super();

    this.field = data?.field || "";
    this.interval = data?.interval || 1;
    this.min_doc_count = data?.min_doc_count || 1;
  }
}

class Terms extends Root implements ITerms {
  public field: string;
  public size: number;

  constructor(data: ITerms) {
    super();

    this.field = data?.field || "";
    this.size = data?.size || 100;
  }
}

class ByRating extends Root implements IByRating {
  public histogram: Histogram;

  constructor() {
    super();

    this.histogram = new Histogram({
      field: "users_rating",
      interval: 1,
    });
  }

  public toJSON() {
    return {
      ...this,
      histogram: this.histogram.toJSON(),
    };
  }
}

class ByYear extends Root implements IByYear {
  public histogram: Histogram;

  constructor() {
    super();

    this.histogram = new Histogram({
      field: "year",
      interval: 1,
      min_doc_count: 1,
    });
  }

  public toJSON() {
    return {
      ...this,
      histogram: this.histogram.toJSON(),
    };
  }
}

class ByDuration extends Root implements IByDuration {
  public histogram: Histogram;

  constructor() {
    super();

    this.histogram = new Histogram({
      field: "runtime",
      interval: 1,
    });
  }

  public toJSON() {
    return {
      ...this,
      histogram: this.histogram.toJSON(),
    };
  }
}

class ByCountry extends Root implements IByCountry {
  public terms: Terms;

  constructor() {
    super();

    this.terms = new Terms({
      field: "countries",
    });
  }

  public toJSON() {
    return {
      ...this,
      terms: this.terms.toJSON(),
    };
  }
}

class ByLanguage extends Root implements IByLanguage {
  public terms: Terms;

  constructor() {
    super();

    this.terms = new Terms({
      field: "languages.keyword",
    });
  }

  public toJSON() {
    return {
      ...this,
      terms: this.terms.toJSON(),
    };
  }
}

class ByGenre extends Root implements IByGenre {
  public terms: Terms;

  constructor() {
    super();

    this.terms = new Terms({
      field: "genre.keyword",
      size: 100,
    });
  }

  public toJSON() {
    return {
      ...this,
      terms: this.terms.toJSON(),
    };
  }
}

export class Aggregation extends Root implements IAggregation {
  public by_rating: ByRating;
  public by_country: ByCountry;
  public by_language: ByLanguage;
  public by_year: ByYear;
  public by_genre: ByGenre;
  public by_duration: ByDuration;

  constructor() {
    super();

    this.by_rating = new ByRating();
    this.by_country = new ByCountry();
    this.by_language = new ByLanguage();
    this.by_year = new ByYear();
    this.by_genre = new ByGenre();
    this.by_duration = new ByDuration();
  }

  public toJSON() {
    return {
      ...this,
      by_rating: this.by_rating.toJSON(),
      by_country: this.by_country.toJSON(),
      by_language: this.by_language.toJSON(),
      by_year: this.by_year.toJSON(),
      by_genre: this.by_genre.toJSON(),
      by_duration: this.by_duration.toJSON(),
    };
  }
}

type TFacet = {key: string, count: number};

export class Facets {
  public rating: TFacet[];
  public country: TFacet[];
  public language: TFacet[];
  public year: TFacet[];
  public genre: TFacet[];
  public duration: TFacet[];

  constructor(rating: TFacet[], country: TFacet[], language: TFacet[], year: TFacet[], genre: TFacet[], duration: TFacet[]) {
    this.rating = rating;
    this.country = country;
    this.language = language;
    this.year = year;
    this.genre = genre;
    this.duration = duration;
  }

  public static fromAggregations(aggregation: any): Facets {
    const rating: TFacet[] = aggregation?.by_rating?.buckets?.map((obj: any) => {
      return new Facet(obj).toJSON();
    });

    const country: TFacet[] = aggregation?.by_country?.buckets?.map((obj: any) => {
      return new Facet(obj).toJSON();
    });

    const language: TFacet[] = aggregation?.by_language?.buckets?.map((obj: any) => {
      return new Facet(obj).toJSON();
    });

    const year: TFacet[] = aggregation?.by_year?.buckets?.map((obj: any) => {
      return new Facet(obj).toJSON();
    });

    const genre: TFacet[] = aggregation?.by_genre?.buckets?.map((obj: any) => {
      return new Facet(obj).toJSON();
    });

    const duration: TFacet[] = aggregation?.by_duration?.buckets?.map((obj: any) => {
      return new Facet(obj).toJSON();
    });

    return new Facets(rating, country, language, year, genre, duration);
  }

  public toJSON() {
    return {
      ...this
    };
  }
}

export class Facet {
  public key: string;
  public count: number;

  constructor(data: any) {
    this.key = data.key || '';
    this.count = data.doc_count || 0;
  }

  public toJSON(): TFacet {
    return {
      key: this.key,
      count: this.count,
    }
  }
}