import {
  gptEnum,
  gptFunction,
  gptString,
  FunctionCallingProvider,
} from "function-gpt";

class WeatherParams {
  @gptString("The city and state, e.g. San Francisco, CA")
  public location!: string;

  @gptEnum(["celsius", "fahrenheit"], "")
  unit!: "celsius" | "fahrenheit";
}

class WeatherProvider extends FunctionCallingProvider {
  @gptFunction("Get the current weather in a given location", WeatherParams)
  async get_current_weather(params: WeatherParams): Promise<string> {
    const { location, unit } = params;
    if (location.toLowerCase().indexOf("tokyo") > -1) {
      return JSON.stringify({
        location: "Tokyo",
        temperature: "10",
        unit: unit,
      });
    } else if (location.toLowerCase().indexOf("san francisco") > -1) {
      return JSON.stringify({
        location: "San Francisco",
        temperature: "72",
        unit: unit,
      });
    } else if (location.toLowerCase().indexOf("paris") > -1) {
      return JSON.stringify({
        location: "Paris",
        temperature: "22",
        unit: unit,
      });
    }
    return "";
  }
}

export const provider = new WeatherProvider();
