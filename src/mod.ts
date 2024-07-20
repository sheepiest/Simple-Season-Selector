import path from "node:path";
import { DependencyContainer } from "tsyringe";
import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { VFS } from "@spt/utils/VFS";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import { jsonc } from "jsonc";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { IWeatherConfig } from "@spt/models/spt/config/IWeatherConfig";

class Mod implements IPostDBLoadMod
{

    private modName = "[Simple Season Selector]"

    public postDBLoad(container: DependencyContainer): void
    {
        // code graciously provided by AcidPhantasm
        const vfs = container.resolve<VFS>("VFS");
        const modConfigJsonC = jsonc.parse(vfs.readFile(path.resolve(__dirname, "../config/config.jsonc")));
        const configServer = container.resolve<ConfigServer>("ConfigServer");
        const weatherConfig : IWeatherConfig = configServer.getConfig(ConfigTypes.WEATHER);
        const logger = container.resolve<ILogger>("WinstonLogger");

        // logger.warning(`${this.modName} Debug: modConfigJsonC = ${modConfigJsonC.SelectedSeason}`) // debug

        const seasonsTuple:[number, string][] = [[0, "Summer"],[1, "Autumn"],[2, "Winter"],[3, "Spring"],[4, "Storm"]] // seasons tuple
        /*
        "summer": 0,
        "autumn": 1,
        "winter": 2,
        "spring": 3,
        "storm": 4
        */

        // config input sanitiser
        function inputSanitiser(input:string) : string
        {
            return input && input[0].toUpperCase() + input.slice(1).toLowerCase()
        }

        const sanitisedSelectedSeason: string = inputSanitiser(modConfigJsonC.SelectedSeason) // pulls and sanitises config value

        // logger.warning(`${this.modName} Debug: sanitisedSelectedSeason = ${sanitisedSelectedSeason}`) // debug

        weatherConfig.overrideSeason = null // preinitialises the season to null

        // setting the db season

        if (sanitisedSelectedSeason === "Auto" || null)
        {
            logger.success(`${this.modName} Season Selected: Auto`) // yes, Auto is just null wearing a fancy hat
            
        } 
        else
        {
            for (let i = 0; i < seasonsTuple.length; i++) // probably should have been a switch, however, what if there were 100 seasons? wait
            {
                if (sanitisedSelectedSeason === seasonsTuple[i][1]) // if @sanitisedSelectedSeason matches string from array, spit out number
                {
                    weatherConfig.overrideSeason = seasonsTuple[i][0]
                    logger.success(`${this.modName} Season Selected: ${seasonsTuple[i][1]}`)
                    break
                }   
            }
        }

        // logger.warning(`${this.modName} Debug: overrideSeason = ${weatherConfig.overrideSeason}`) // debug
        
        if (sanitisedSelectedSeason !== "Auto" && weatherConfig.overrideSeason === null) 
        {
            logger.warning(`${this.modName} Did you misspell: "${modConfigJsonC.SelectedSeason}"? Defaulting to Auto`) // the perks of being a Helper is kinda knowing what issues people will have
        }
    
    }
}

export const mod = new Mod();