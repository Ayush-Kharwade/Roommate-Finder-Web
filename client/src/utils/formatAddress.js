/**
 * OpenCage's `formatted` string is often unrecognisable to users — it returns
 * OSM's administrative naming ("Ghorpuri, Pune - 411001, Maharashtra, India")
 * rather than the locality people actually use ("Koregaon Park").
 *
 * The familiar name is usually present in `components`; these helpers pull it out.
 */

/** The most specific human-recognisable place name in a result. */
export function primaryName(result) {
    const c = result.components || {};
    return c.residential
        || c.neighbourhood
        || c.suburb
        || c.village
        || c.town
        || c.road
        || c.city
        || c.county
        || '';
}

/** Secondary context line — city and state, minus anything already shown. */
export function secondaryName(result) {
    const c = result.components || {};
    const primary = primaryName(result);
    const parts = [c.city || c.town || c.state_district, c.state, c.postcode]
        .filter(Boolean)
        .filter(p => p !== primary);
    return [...new Set(parts)].join(', ');
}

/** Single-line label, for inputs and stored addresses. */
export function formatAddress(result) {
    const primary = primaryName(result);
    const secondary = secondaryName(result);
    if (!primary) return result.formatted || '';
    return secondary ? `${primary}, ${secondary}` : primary;
}