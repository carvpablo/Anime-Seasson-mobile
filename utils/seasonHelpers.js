/**
 * Returns the current anime season and year.
 * Seasons: winter (Jan-Mar), spring (Apr-Jun), summer (Jul-Sep), fall (Oct-Dec)
 *
 * @returns {{ season: string, year: number }}
 */
export const getCurrentSeason = () => {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const year = now.getFullYear();

  let season;
  if (month >= 1 && month <= 3) season = 'winter';
  else if (month >= 4 && month <= 6) season = 'spring';
  else if (month >= 7 && month <= 9) season = 'summer';
  else season = 'fall';

  return { season, year };
};

/**
 * Capitalize the first letter of a season string.
 * @param {string} season
 * @returns {string}
 */
export const capitalizeSeason = (season) => {
  if (!season) return '';
  return season.charAt(0).toUpperCase() + season.slice(1);
};

/**
 * Get the current day of the week as a lowercase string matching Jikan's filter.
 * @returns {string} e.g. 'monday'
 */
export const getCurrentDay = () => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
};
