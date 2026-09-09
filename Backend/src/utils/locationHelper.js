const nearbyLocations = {
    Akurdi: ["Nigdi", "Chinchwad", "Pimpri", "Ravet"],
    Nigdi: ["Akurdi", "Chinchwad", "Pimpri"],
    Chinchwad: ["Akurdi", "Nigdi", "Pimpri"],
    Pimpri: ["Akurdi", "Nigdi", "Chinchwad"],
    Ravet: ["Akurdi", "Nigdi"]
};

const getNearbyLocations = (location) => {
    return nearbyLocations[location] || [];
};

module.exports = {
    getNearbyLocations
};