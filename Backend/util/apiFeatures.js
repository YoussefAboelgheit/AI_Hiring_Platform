const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

const RESERVED_QUERY_FIELDS = ["page", "sort", "limit", "fields", "search", "q", "keyword"];
const MONGO_OPERATORS = ["gte", "gt", "lte", "lt", "in", "nin", "ne"];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toPositiveInteger(value, defaultValue) {
  const parsedValue = Number.parseInt(value, 10);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : defaultValue;
}

export default class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString || {};
  }

  filter() {
    const queryObject = { ...this.queryString };

    RESERVED_QUERY_FIELDS.forEach((field) => delete queryObject[field]);

    const filterQuery = JSON.parse(
      JSON.stringify(queryObject).replace(
        new RegExp(`\\b(${MONGO_OPERATORS.join("|")})\\b`, "g"),
        (operator) => `$${operator}`
      )
    );

    this.query = this.query.find(filterQuery);
    return this;
  }

  search(searchableFields = []) {
    const searchTerm = this.queryString.search || this.queryString.q || this.queryString.keyword;

    if (!searchTerm || !Array.isArray(searchableFields) || searchableFields.length === 0) {
      return this;
    }

    const safeSearchTerm = escapeRegExp(String(searchTerm).trim());
    if (!safeSearchTerm) return this;

    this.query = this.query.find({
      $or: searchableFields.map((field) => ({
        [field]: { $regex: safeSearchTerm, $options: "i" },
      })),
    });

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = String(this.queryString.sort).split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  paginate() {
    const page = toPositiveInteger(this.queryString.page, DEFAULT_PAGE);
    const requestedLimit = toPositiveInteger(this.queryString.limit, DEFAULT_LIMIT);
    const limit = Math.min(requestedLimit, MAX_LIMIT);
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = String(this.queryString.fields).split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }

    return this;
  }

  populate(populateOptions) {
    if (!populateOptions) return this;

    const options = Array.isArray(populateOptions) ? populateOptions : [populateOptions];
    options.forEach((option) => {
      this.query = this.query.populate(option);
    });

    return this;
  }
}
