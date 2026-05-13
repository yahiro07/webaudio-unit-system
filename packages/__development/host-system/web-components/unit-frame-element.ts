import { html, LitElement, PropertyValues } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import {
  HostSystem,
  hostSystem_createHostInterfaceForUnit,
  hostSystem_wrapAddUnitAgent,
  hostSystem_wrapConnectUnits,
  UnitAgentInHostSide,
} from "../host";
import { HostInterface } from "../unit";

@customElement("unit-frame")
export default class UnitFrameElement extends LitElement {
  @property({ attribute: true })
  src: string = "";

  @property({ attribute: "unit-id" })
  unitId: string = "";

  @property({ attribute: "host-bpm" })
  hostBpm: number = 120;

  @property({ attribute: "host-playing" })
  hostPlaying: boolean = false;

  @property({ attribute: "input-notes" })
  inputNotes: number[] = [];

  @property({ attribute: "dest-unit-id" })
  destUnitId: string = "";

  @property({ type: Object, attribute: false })
  hostSystem: HostSystem | undefined;

  @query("iframe")
  private iframe: HTMLIFrameElement | undefined;

  private initialized = false;

  private unitAgent: UnitAgentInHostSide | undefined;

  private tryInitialize() {
    const { iframe, hostSystem, initialized } = this;
    if (iframe && hostSystem && !initialized) {
      const el = this.iframe;
      if (el) {
        const win = el?.contentWindow;
        if (win) {
          const hostInterface = hostSystem_createHostInterfaceForUnit(
            hostSystem,
            this.unitId,
            (unitAgent) => {
              this.unitAgent = unitAgent;
              hostSystem_wrapAddUnitAgent(hostSystem, unitAgent);
              console.log(`unitAgent loaded for ${this.unitId}`);
              if (this.destUnitId) {
                hostSystem_wrapConnectUnits(
                  hostSystem,
                  this.unitId,
                  this.destUnitId,
                );
              }
            },
          );
          (win as { hostInterface?: HostInterface }).hostInterface =
            hostInterface;
        }
      }
      this.initialized = true;
    }
  }

  protected updated(changedValues: PropertyValues): void {
    this.tryInitialize();

    const bpm = changedValues.has("hostBpm") ? this.hostBpm : undefined;
    const playing = changedValues.has("hostPlaying")
      ? this.hostPlaying
      : undefined;
    const notes = changedValues.has("inputNotes") ? this.inputNotes : undefined;
    // const destUnitId = changedValues.has("destUnitId")
    //   ? this.destUnitId
    //   : undefined;

    if (bpm !== undefined) {
      console.log({ bpm });
    }
    if (playing !== undefined) {
      console.log({ playing });
    }
    if (notes !== undefined) {
      const _notes = [...notes];
      console.log({ _notes });
    }
    // if (destUnitId !== undefined) {
    //   if (this.hostSystem) {
    //     console.log(`try to connect`);
    //     hostSystem_connectUnits(this.hostSystem, this.unitId, destUnitId);
    //   } else {
    //     console.log(`failed to setup connection, hostSystem is not ready`);
    //   }
    // }
  }

  render() {
    return html`<iframe src="${this.src}" />`;
  }
}
