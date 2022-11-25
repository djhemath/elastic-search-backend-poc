import Express from "express";
import { IMovieRequest } from "./models/Movie";
import ElasticSearchService, { ElasticSearch } from './services/elasticsearch.service';
import cors from 'cors';
import path from "path";

const app = Express();

app.use(Express.json());

app.use(cors());

app.use(Express.static("web-client"));

function buildFilterQuery(data: IMovieRequest) {

  console.log("\n\n")
  console.log(JSON.stringify(data, null, 2));
  console.log("\n\n")

  let areThereNoProperties = true;

  for(let key in data) {
    if(key !== 'page' && key !== 'limit') {
        if(Boolean((data as any)[key])) {
            areThereNoProperties = false;
        }
    }
  }

  let finalQuery: any = {
    from: 0,
    size: 10,
  };

  if(data.limit) {
    finalQuery.size = data.limit;
  }

  if(data.page) {
    finalQuery.from = data.page * finalQuery.size;
  }

  if (areThereNoProperties) {
    return finalQuery;
  }

  finalQuery = {
    ...finalQuery,
    bool: {
      must: [],
      filter: [],
      should: [],
    },
  };

  if (data.searchText) {
    finalQuery = {
      ...finalQuery,
      bool: {
        ...finalQuery.bool,
        must: [
          {
            multi_match: {
              query: data.searchText,
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
      },
    };
  }

  if (data.country) {
    finalQuery = {
      ...finalQuery,
      bool: {
        ...finalQuery.bool,
        filter: [
          ...finalQuery.bool.filter,
          {
            term: {
              countries: "Canada",
            },
          },
        ],
      },
    };
  }

  if (data.ratingMin && data.ratingMax) {
    finalQuery = {
      ...finalQuery,
      bool: {
        ...finalQuery.bool,
        filter: [
          ...finalQuery.bool.filter,
          {
            range: {
              users_rating: {
                gte: data.ratingMin,
                lte: data.ratingMax,
              },
            },
          },
        ],
      },
    };
  } else if (data.ratingMin) {
    finalQuery = {
      ...finalQuery,
      bool: {
        ...finalQuery.bool,
        filter: [
          ...finalQuery.bool.filter,
          {
            range: {
              users_rating: {
                gte: data.ratingMin
              },
            },
          },
        ],
      },
    };
  } else if (data.ratingMax) {
    finalQuery = {
      ...finalQuery,
      bool: {
        ...finalQuery.bool,
        filter: [
          ...finalQuery.bool.filter,
          {
            range: {
              users_rating: {
                lte: data.ratingMax,
              },
            },
          },
        ],
      },
    };
  }


  if (data.language) {
    finalQuery = {
      ...finalQuery,
      bool: {
        ...finalQuery.bool,
        filter: [
          ...finalQuery.bool.filter,
          {
            term: {
              "languages.keyword": data.language,
            },
          },
        ],
      },
    };
  }

  if (data.year) {
    finalQuery = {
      ...finalQuery,
      bool: {
        ...finalQuery.bool,
        filter: [
          ...finalQuery.bool.filter,
          {
            term: {
              year: data.year,
            },
          },
        ],
      },
    };
  }

  if (data.genre && Array.isArray(data.genre) && data.genre.length > 0) {

    const genreFilters = data.genre.map(g => {
      return ({
        term: {
          "genre.keyword": g,
        },
      });
    });

    finalQuery = {
      ...finalQuery,
      bool: {
        ...finalQuery.bool,
        filter: [
          ...finalQuery.bool.filter,
        ],
        should: [
          ...finalQuery.bool.should,
          ...genreFilters,
        ],
      },
    };
  }

  if (data.durationMin && data.durationMax) {
    finalQuery = {
      ...finalQuery,
      bool: {
        ...finalQuery.bool,
        filter: [
          ...finalQuery.bool.filter,
          {
            range: {
              runtime: {
                gte: data.durationMin,
                lte: data.durationMax,
              },
            },
          },
        ],
      },
    };
  } else if (data.durationMin) {
    finalQuery = {
      ...finalQuery,
      bool: {
        ...finalQuery.bool,
        filter: [
          ...finalQuery.bool.filter,
          {
            range: {
              runtime: {
                gte: data.durationMin
              },
            },
          },
        ],
      },
    };
  } else if (data.durationMax) {
    finalQuery = {
      ...finalQuery,
      bool: {
        ...finalQuery.bool,
        filter: [
          ...finalQuery.bool.filter,
          {
            range: {
              runtime: {
                lte: data.durationMax,
              },
            },
          },
        ],
      },
    };
  }

  return finalQuery;
}

app.get('/movies', (req, res) => {
    const { searchText, country, ratingMin, ratingMax, language, year, genre, durationMin, durationMax, page, limit } = req.query as any;

    const query = buildFilterQuery({
        searchText: searchText,
        country: country,
        ratingMax: Number(ratingMax),
        ratingMin: Number(ratingMin),
        language: language,
        year: Number(year),
        genre: genre,
        durationMax: Number(durationMax),
        durationMin: Number(durationMin),
        page: Number(page),
        limit: Number(limit)
    });

    console.log(query);

    ElasticSearchService
    .search(query)
    .then(elasticResult => res.json({
      status: 'success',
      data: ElasticSearch.toResponse(elasticResult)
    }))
    .catch(err => {
      console.log(err);
      res.json({
        status: 'failure',
        data: {
          message: err
        }
      });
    });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "web-client", "index.html"))
});

app.listen(7000, () => console.log("Server is up and running"));
