"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mod = void 0;
const node_path_1 = __importDefault(require("node:path"));
const ConfigTypes_1 = require("C:/snapshot/project/obj/models/enums/ConfigTypes");
const jsonc_1 = require("C:/snapshot/project/node_modules/jsonc");
class Mod {
    modName = "[Simple Season Selector]";
    postDBLoad(container) {
        // code graciously provided by AcidPhantasm
        const vfs = container.resolve("VFS");
        const modConfigJsonC = jsonc_1.jsonc.parse(vfs.readFile(node_path_1.default.resolve(__dirname, "../config/config.jsonc")));
        const configServer = container.resolve("ConfigServer");
        const weatherConfig = configServer.getConfig(ConfigTypes_1.ConfigTypes.WEATHER);
        const logger = container.resolve("WinstonLogger");
        // logger.warning(`${this.modName} Debug: modConfigJsonC = ${modConfigJsonC.SelectedSeason}`) // debug
        const seasonsTuple = [[0, "Summer"], [1, "Autumn"], [2, "Winter"], [3, "Spring"], [4, "Storm"]]; // seasons tuple
        /*
        "summer": 0,
        "autumn": 1,
        "winter": 2,
        "spring": 3,
        "storm": 4
        */
        // config input sanitiser
        function inputSanitiser(input) {
            return input && input[0].toUpperCase() + input.slice(1).toLowerCase();
        }
        const sanitisedSelectedSeason = inputSanitiser(modConfigJsonC.SelectedSeason); // pulls and sanitises config value
        // logger.warning(`${this.modName} Debug: sanitisedSelectedSeason = ${sanitisedSelectedSeason}`) // debug
        weatherConfig.overrideSeason = null; // preinitialises the season to null
        // setting the db season
        if (sanitisedSelectedSeason === "Auto" || null) {
            logger.success(`${this.modName} Season Selected: Auto`); // yes, Auto is just null wearing a fancy hat
        }
        else {
            for (let i = 0; i < seasonsTuple.length; i++) // probably should have been a switch, however, what if there were 100 seasons? wait
             {
                if (sanitisedSelectedSeason === seasonsTuple[i][1]) // if @sanitisedSelectedSeason matches string from array, spit out number
                 {
                    weatherConfig.overrideSeason = seasonsTuple[i][0];
                    logger.success(`${this.modName} Season Selected: ${seasonsTuple[i][1]}`);
                    break;
                }
            }
        }
        // logger.warning(`${this.modName} Debug: overrideSeason = ${weatherConfig.overrideSeason}`) // debug
        if (sanitisedSelectedSeason !== "Auto" && weatherConfig.overrideSeason === null) {
            logger.warning(`${this.modName} Did you misspell: "${modConfigJsonC.SelectedSeason}?" Defaulting to Auto`); // the perks of being a Helper is kinda knowing what issues people will have
        }
    }
}
exports.mod = new Mod();
//# sourceMappingURL=mod.js.map