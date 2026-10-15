module.exports = {
    name: "Websthetic",
    email: "hello@websthetic.com",
    phoneForTel: "555-779-4407",
    phoneFormatted: "(555) 779-4407",
    address: {
        lineOne: "First Address Line",
        lineTwo: "Second Address Line",
        city: "Toronto",
        state: "ON",
        zip: "",
        country: "CA",
        // shown in the footer, e.g. "Toronto, Canada"
        countryName: "Canada",
        mapLink: "https://www.google.com/maps/place/Toronto,+ON,+Canada",
    },
    socials: {
        instagram: "https://www.instagram.com/websthetic.co/",
        linkedin: "https://www.linkedin.com/company/websthetic/",
    },
    //! Make sure you include the file protocol (e.g. https://) and that NO TRAILING SLASH is included
    domain: "https://www.websthetic.com",
    // Passing the isProduction variable for use in HTML templates
    isProduction: process.env.ELEVENTY_ENV === "PROD",
};
