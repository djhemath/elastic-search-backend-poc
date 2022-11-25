import { Facets } from "./Aggregation";

export interface IMovie {
    id: string;
    title: string;
    year: number;
    rating: number;
    votes: number;
    image: string;
    countries: string[];
    languages: string[];
    actors: string[];
    genre: string[];
    directors: string[];
    description: string[];
    duration: number;
    imdbUrl: string;
};

export interface IMovieRequest {
    searchText?: string;
    country?: string;
    ratingMin?: number;
    ratingMax?: number;
    language?: string;
    year?: number;
    genre?: string[];
    durationMin?: number;
    durationMax?: number;
    page?: number;
    limit?: number;
}

export interface IMovieResponse {
    searchDuration: number;
    total: number;
    movies: IMovie[];
    facets: Facets;
}

export class Movie implements IMovie {
    id: string;
    title: string;
    year: number;
    rating: number;
    votes: number;
    image: string;
    countries: string[];
    languages: string[];
    actors: string[];
    genre: string[];
    directors: string[];
    description: string[];
    duration: number;
    imdbUrl: string;

    constructor(data: any) {
        this.id = data.id || '';
        this.title = data.title || '';
        this.year = data.year || 0;
        this.rating = data.users_rating || 0;
        this.votes = data.votes || 0;
        this.image = data.img_url || '';
        this.countries = data.countries || [];
        this.languages = data.languages || [];
        this.actors = data.actors || [];
        this.genre = data.genre || [];
        this.directors = data.directors || [];
        this.description = data.description || '';
        this.duration = data.runtime || 0;
        this.imdbUrl = data.imdb_url || '';
    }

    public toJSON(): IMovie {
        return {
            ...this
        };
    }
}