import type { Denops } from "jsr:@denops/core@^7.0.0";
import { getreginfo, has } from "jsr:@denops/std@^7.0.0/function";
import { globalOptions } from "jsr:@denops/std@^7.0.0/variable";
import {
  Unprintable,
  type UnprintableUserData,
} from "jsr:@milly/ddc-unprintable@^5.0.0";
import { accumulate } from "jsr:@milly/denops-batch-accumulate@^1.0.0";
import {
  BaseSource,
  type GatherArguments,
  type OnCompleteDoneArguments,
  type OnInitArguments,
} from "jsr:@shougo/ddc-vim@^9.0.0/source";
import { type Item as DdcItem } from "jsr:@shougo/ddc-vim@^9.0.0/types";

type Params = {
  /** Register names to collect. (default: "")
   *
   * Specify the name of the register to collect, such as "012ab#".
   * If empty, all registers are collected.
   */
  registers: string;
  /** Max width of the abbreviates column. (default: 0)
   *
   * If 0 is specified, be unlimited.
   */
  maxAbbrWidth: number;
  /** Highlight group name for unprintable chars. (default: "SpecialKey")
   *
   * If empty, highlight is disabled.
   */
  ctrlCharHlGroup: string;
};

type OperatorWise = "c" | "l" | "b" | "";

type UserData = Record<string, never> & UnprintableUserData;

type Item = DdcItem<UserData>;

type RegType = "" | "v" | "V" | `\x16${number}`;

type RegInfo = {
  regname: string;
  regcontents: string[];
  regtype: RegType;
};

// deno-fmt-ignore
const VIM_REGISTERS = [
  '"',
  "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j",
  "k", "l", "m", "n", "o", "p", "q", "r", "s", "t",
  "u", "v", "w", "x", "y", "z",
  "-", ".", ":", "#", "%", "/", "=",
] as const;
const VIM_CLIPBOARD_REGISTERS = ["*", "+"] as const;

export class Source extends BaseSource<Params, UserData> {
  #unprintable?: Unprintable<UserData>;
  #hasClipboard = true;

  override params(): Params {
    return {
      registers: "",
      maxAbbrWidth: 0,
      ctrlCharHlGroup: "SpecialKey",
    };
  }

  override async onInit(args: OnInitArguments<Params>): Promise<void> {
    const { denops, sourceParams: { ctrlCharHlGroup } } = args;

    this.#unprintable = new Unprintable<UserData>({
      highlightGroup: ctrlCharHlGroup,
      callbackId: `source/${this.name}`,
    });
    [this.#hasClipboard] = await Promise.all([
      has(denops, "clipboard"),
      this.#unprintable!.onInit({ ...args, denops }),
    ]);
  }

  override async gather(
    args: GatherArguments<Params>,
  ): Promise<Item[]> {
    const {
      denops,
      context: { nextInput },
      sourceParams: { registers, maxAbbrWidth, ctrlCharHlGroup },
    } = args;

    const [abbrWidth, regInfos] = await Promise.all([
      this.#getAbbrWidth(denops, maxAbbrWidth),
      this.#getRegisters(denops, registers),
    ]);
    this.#unprintable!.abbrWidth = abbrWidth;
    this.#unprintable!.highlightGroup = ctrlCharHlGroup;
    const items = this.#generateItems(regInfos);
    return this.#unprintable!.convertItems(denops, items, nextInput);
  }

  override onCompleteDone(
    args: OnCompleteDoneArguments<Params, UserData>,
  ): Promise<void> {
    return this.#unprintable!.onCompleteDone(args);
  }

  async #getAbbrWidth(denops: Denops, maxAbbrWidth: number): Promise<number> {
    const vimColumns = await globalOptions.get(denops, "columns", 9999);
    return maxAbbrWidth > 0 ? Math.min(maxAbbrWidth, vimColumns) : vimColumns;
  }

  async #getRegisters(denops: Denops, registers: string): Promise<RegInfo[]> {
    const allRegSet = new Set<string>([
      ...(this.#hasClipboard ? VIM_CLIPBOARD_REGISTERS : []),
      ...VIM_REGISTERS,
    ]);
    const regSet = registers.length > 0
      ? allRegSet.intersection(new Set(registers.split("")))
      : allRegSet;
    const reginfos = await accumulate(denops, (helper) => {
      return Promise.all([...regSet].map(async (regname) => ({
        ...await getreginfo(helper, regname),
        regname,
      })));
    });
    return reginfos.filter(
      (reginfo): reginfo is RegInfo => Object.hasOwn(reginfo, "regcontents"),
    );
  }

  #generateItems(regInfos: RegInfo[]): Item[] {
    return regInfos.map(({ regname, regcontents, regtype }): Item => {
      const word = regContentsTypeToText(regcontents, regtype);
      const wise = regTypeToOperatorWise(regtype);
      return {
        word,
        info: word,
        kind: wise,
        menu: regname,
      };
    });
  }
}

function regTypeToOperatorWise(type: RegType): OperatorWise {
  if (type === "v") return "c";
  if (type === "V") return "l";
  if (type.charCodeAt(0) === 0x16) return "b";
  return "";
}

function regContentsToText(contents: string[]): string {
  return contents.map((s) => s.replaceAll("\n", "\x00")).join("\n");
}

function regContentsTypeToText(contents: string[], type: RegType): string {
  let text = regContentsToText(contents);
  if (["V", "\x16"].includes(type[0])) {
    text += "\n";
  }
  return text;
}
