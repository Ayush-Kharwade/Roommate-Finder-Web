import { Helmet } from 'react-helmet-async';

function SEO({ title, description, image }) {
    const fullTitle = title ? `${title} | RoommateFinder` : 'RoommateFinder — Find Rooms & Compatible Flatmates in India';
    const desc = description || 'Find verified rooms, PGs and compatible flatmates across India. Connect directly with no brokers.';

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={desc} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={desc} />
            {image && <meta property="og:image" content={image} />}
            <meta property="og:type" content="website" />
            <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
        </Helmet>
    );
}

export default SEO;