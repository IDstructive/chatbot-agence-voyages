import type { destination } from "./destination"


export const destinations:destination[] = 
    [{
        nom: "Randonnée camping en Lozère",
        labels: ["sport", "montagne", "campagne", "été"],
        accessibleHandicap: false
    },{
        nom: "5 étoiles à Chamonix option fondue",
        labels: ["montagne", "détente", "hiver", "été"],
        accessibleHandicap: true,
    }, {
        nom: "5 étoiles à Chamonix option ski",
        labels: ["montagne", "sport", "hiver"],
        accessibleHandicap: false,
    },
    {
        nom: "Palavas de paillotes en paillotes",
        labels: ["plage", "ville", "détente", "paillote", "été"],
        accessibleHandicap: true,
    }, {
        nom: "5 étoiles en rase campagne",
        labels: ["campagne", "détente"],
        accessibleHandicap: true,
    }
]
