import { Client } from "@elastic/elasticsearch";
import { Aggregation, Facets } from "../models/Aggregation";
import { IMovie, IMovieResponse, Movie } from "../models/Movie";
import { IQuery, Query } from "../models/Query";

const elasticClient = require("../configurations/elasticsearch.config");
const data = require("../data/movie.json");

const INDEX_NAME = "movie_index";

async function loadIndex() {
  console.log("Cleansing data");
  const cleansedData = data.map((movie: any) => {
    return {
      ...movie,
      year: Number(movie.year),
      users_rating: Number(movie.users_rating),
      votes: Number(movie.votes?.split(",").join("")),
      metascore: Number(movie.metascore),
      runtime: Number(
        Number(movie.runtime?.replace(" min", "") / 60).toFixed(1)
      ),
    };
  });
  console.log("Cleansed data");

  const INDEX_NAME = "movie_index";

  await elasticClient.indices.create({
    index: INDEX_NAME,
    mappings: {
      properties: {
        title: {
          type: "text",
          fields: {
            keyword: {
              type: "keyword",
            },
          },
        },
        rating: {
          enabled: false,
        },
        year: {
          type: "long",
        },
        users_rating: {
          type: "long",
        },
        votes: {
          type: "long",
        },
        metascore: {
          type: "long",
        },
        img_url: {
          enabled: false,
        },
        countries: {
          type: "keyword",
        },
        languages: {
          type: "text",
          fields: {
            keyword: {
              type: "keyword",
            },
          },
        },
        actors: {
          type: "text",
          fields: {
            keyword: {
              type: "keyword",
            },
          },
        },
        genre: {
          type: "text",
          fields: {
            keyword: {
              type: "keyword",
            },
          },
        },
        tagline: {
          enabled: false,
        },
        description: {
          type: "text",
          fields: {
            keyword: {
              type: "keyword",
            },
          },
        },
        directors: {
          type: "text",
          fields: {
            keyword: {
              type: "keyword",
            },
          },
        },
        runtime: {
          type: "long",
        },
        imdb_url: {
          enabled: false,
        },
      },
    },
  });

  const operations = cleansedData.flatMap((doc: any) => [
    { index: { _index: INDEX_NAME } },
    doc,
  ]);

  elasticClient
    .bulk({
      refresh: true,
      operations,
    })
    .then((res: any) => {
      if (res.errors) {
        const erroredDocuments: any[] = [];
        // The items array has the same order of the dataset we just indexed.
        // The presence of the `error` key indicates that the operation
        // that we did for the document has failed.
        res.items.forEach((action: any, i: number) => {
          const operation = Object.keys(action)[0];
          if (action[operation].error) {
            erroredDocuments.push({
              // If the status is 429 it means that you can retry the document,
              // otherwise it's very likely a mapping error, and you should
              // fix the document before to try it again.
              status: action[operation].status,
              error: action[operation].error,
              operation: data[i * 2],
              document: data[i * 2 + 1],
            });
          }
        });
        console.log(erroredDocuments);
      }
    })
    .catch((err: any) => console.log(err));
}

// loadIndex();

export class ElasticSearch {
  private client;

  constructor(client: Client) {
    this.client = client;
  }

  public buildAggregationObject() {
    return new Aggregation().toJSON();
  }

  public buildQueryObject(query: IQuery) {
    return new Query(query).toJSON();
  }

  getAggregations() {
    return this.client.search({
      index: INDEX_NAME,
      size: 0,
      aggs: this.buildAggregationObject() as any,
    });
  }

  search(filter: IQuery) {

    const query = this.buildQueryObject(filter);
    const aggregations = this.buildAggregationObject();

    console.log(JSON.stringify({
      index: INDEX_NAME,
      from: filter.from,
      size: filter.size,
      ...(query && {query: (query as any)}),
      aggs: (aggregations as any)
    }, null, 4));

    return this.client.search({
      index: INDEX_NAME,
      from: filter.from,
      size: filter.size,
      ...(query && {query: (query as any)}),
      aggs: (aggregations as any)
    });
  }

  _search(filter = {}) {
    return this.client.search({
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query: "interstellar",
                fields: [
                  "title^2",
                  "description",
                  "actors",
                  "directors",
                  "genre",
                ],
              },
            },
          ],
          filter: [
            {
              term: {
                countries: "Canada",
              },
            },
            {
              range: {
                users_rating: {
                  gte: 6,
                  lte: 9,
                },
              },
            },
            {
              term: {
                "languages.keyword": "English",
              },
            },
            {
              term: {
                year: 2014,
              },
            },
            {
              term: {
                "genre.keyword": "Adventure",
              },
            },
            {
              range: {
                runtime: {
                  gte: 2,
                  lte: 3,
                },
              },
            },
          ],
        },
      },
    });
  }

  public static toResponse(response: any):IMovieResponse {
    const searchDuration: number = response.took;
    const total: number = response.hits.total.value;
    const movies: IMovie[] = response.hits.hits.map((hit: any) => {
      const movie = new Movie({
        ...hit._source,
        id: hit._id
      });

      return movie.toJSON()
    });
    const facets = Facets.fromAggregations(response.aggregations).toJSON()

    return {
      searchDuration,
      total,
      movies,
      facets
    };
  }
}

const ElasticSearchService = new ElasticSearch(elasticClient);

export default ElasticSearchService;
