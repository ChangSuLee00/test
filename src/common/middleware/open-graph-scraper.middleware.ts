import * as ogs from 'open-graph-scraper';

export const openGraphScraper = async (req, res, next) => {
  try {
    const options = { url: req.body.URL };
    const data = await ogs(options);
    const { error, result, response } = data;

    if (result.ogImage) {
      req.body = { ...req.body, img: result.ogImage };
    }
    next();
  } catch (error) {
    next();
  }
};
