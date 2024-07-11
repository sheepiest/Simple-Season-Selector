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
    //lets the user type out the season name instead of having to mess with numbers
    private mappings: { [key: string]: number };
    private logoutputMappings: { [key: string]: string };
    private modName: "[Simple Season Selector]"

    constructor() 
    {
        this.mappings = {
            "summer": 0,
            "autumn": 1,
            "winter": 2,
            "spring": 3,
            "storm": 4
        };
        this.logoutputMappings={
            0: "Summer",
            1: "Autumn",
            2: "Winter",
            3: "Spring",
            4: "Storm",
            null: "Auto"
        }
    }
    //turns seasons into numbers. probably overkill, but making it more streamlined would require knowledge of what is going on. also, means Auto gets turned into null
    public mapStringToNumber(input: string): number | null 
    {
        const lowerCaseInput = input.toLowerCase();
        if (Object.prototype.hasOwnProperty.call(this.mappings, lowerCaseInput)) 
            
        {
            return this.mappings[lowerCaseInput];
        }
        else 
        {
            return null;
        }
    }
    //turns a number back into a displayable season for the log
    private mapAnyToString(input: any): string | null 
    {
        if (Object.prototype.hasOwnProperty.call(this.logoutputMappings, input)) 
            
        {
            return this.logoutputMappings[input];
        }
        else 
        {
            return null;
        }
    }


    public postDBLoad(container: DependencyContainer): void
    {
        //base code graciously provided by AcidPhantasm
        const vfs = container.resolve<VFS>("VFS");
        const modConfigJsonC = jsonc.parse(vfs.readFile(path.resolve(__dirname, "../config/config.jsonc")));
        const configServer = container.resolve<ConfigServer>("ConfigServer");
        const weatherConfig : IWeatherConfig = configServer.getConfig(ConfigTypes.WEATHER);
        const logger = container.resolve<ILogger>("WinstonLogger");

        //grabbing the config value, turning it into a number
        const selectedseasonNumber = this.mapStringToNumber(modConfigJsonC.SelectedSeason)
        
        //setting the db season to the number
        weatherConfig.overrideSeason = selectedseasonNumber
        
        //checks what overrideSeason is for outputting to the console
        const loggedSeason = this.mapAnyToString(weatherConfig.overrideSeason)

        //spits out the selected season string in the console in case the user forgor, also looks nice
        logger.success(`${this.modName} Selected season: ${loggedSeason}`)

        //debug logs to see if it did the thing properly
        //logger.info(`${selectedseasonNumber}`)
        //logger.info(`${weatherConfig.overrideSeason}`)
    }
}

export const mod = new Mod();
