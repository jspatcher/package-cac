import type { IInletsMeta, IOutletsMeta } from "@jspatcher/jspatcher/src/core/objects/base/AbstractObject";
import type GuidoWorker from "@jspatcher/jspatcher/src/core/workers/GuidoWorker";
import type { Chord, Note, Pitch, Roll, Sequence } from "@shren/sol";
import { isBang } from "../sdk";
import CacDefaultObject from "./default";

interface IS {
    guido: GuidoWorker;
    buffer: $ARHandler;
    busy: boolean;
    busyInput: boolean;
    tasks: (Chord | Note | Pitch | Roll | Sequence)[];
}

export default class ToGuido extends CacDefaultObject<{}, {}, [Chord | Note | Pitch | Roll | Sequence, boolean], [$ARHandler]> {
    static inlets: IInletsMeta = [{
        isHot: true,
        type: "object",
        description: "A musical object: Chord | Note | Pitch | Roll | Sequence"
    }, {
        isHot: false,
        type: "boolean",
        description: "Busy state input"
    }];
    static outlets: IOutletsMeta = [{
        type: "anything",
        description: "A Guido reference for Guido View"
    }];
    _: IS = { guido: undefined, buffer: undefined, busy: false, busyInput: false, tasks: [] };
    scheduleTask(data?: Chord | Note | Pitch | Roll | Sequence) {
        if (data) this._.tasks.push(data);
        if (!this._.busy && !this._.busyInput) this.executeTask();
    }
    async executeTask() {
        this._.busy = true;
        if (this._.tasks.length) {
            const data = this._.tasks.shift();
            this.outlet(0, await data.toGuidoAR(this._.guido));
            this.scheduleTask();
        }
        this._.busy = false;
    }
    subscribe() {
        super.subscribe();
        this.on("preInit", () => {
            this.inlets = 2;
            this.outlets = 1;
        });
        this.on("postInit", async () => {
            this._.guido = await this.env.getGuido();
        });
        this.on("inlet", ({ data, inlet }) => {
            if (inlet === 0) {
                if (isBang(data) && typeof this._.buffer === "number") {
                    this.outlet(0, this._.buffer);
                } else if (typeof data === "object" && data.toGuidoAR) {
                    this.scheduleTask(data);
                }
            } else if (inlet === 1) {
                this._.busyInput = !!data;
                this.scheduleTask();
            }
        });
    }
}
