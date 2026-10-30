import type { Grind, Product } from "./types";

export type Recipe = { method: string; dose: string; water: string; temp: string; time: string; steps: string[] };

/** A starting recipe for each brew method, nudged for the roast: lighter roasts like hotter water */
export function recipe(grind: Grind, roast: Product["roast"] = "medium"): Recipe {
  const temp = roast === "light" ? "96°C" : roast === "dark" ? "90°C" : "93°C";
  switch (grind) {
    case "espresso":
      return {
        method: "Espresso",
        dose: "18g coffee",
        water: "36–40g out",
        temp,
        time: "27–32 seconds",
        steps: ["Grind fine and level the bed with a gentle, even tamp.", "Aim for twice the dose out: 18g in, about 38g in the cup.", "Sour? Grind finer. Bitter? Grind a touch coarser."],
      };
    case "moka":
      return {
        method: "Moka pot",
        dose: "Fill the basket, don't tamp",
        water: "Just below the valve",
        temp: "Start with hot water",
        time: "4–5 minutes",
        steps: ["Fill the base with just-boiled water so the coffee doesn't stew.", "Heat on medium with the lid open.", "Take it off the heat as soon as it starts to sputter."],
      };
    case "cafetiere":
      return {
        method: "Cafetière",
        dose: "30g coffee",
        water: "500ml",
        temp,
        time: "4 minutes",
        steps: ["Add coarse coffee and pour all the water over it.", "After 4 minutes, stir the crust and scoop off the foam.", "Wait 5 more minutes if you can, then plunge gently and pour."],
      };
    case "filter":
    case "whole":
    default:
      return {
        method: "Pour-over (V60)",
        dose: "15g coffee",
        water: "250g",
        temp,
        time: "3 minutes",
        steps: ["Rinse the paper, add coffee and pour 40g of water to bloom for 30 seconds.", "Pour slowly in circles up to 150g, then to 250g by 1:30.", "Let it drain; aim to finish around 3:00."],
      };
  }
}
