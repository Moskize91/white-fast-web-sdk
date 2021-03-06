import * as React from "react";
import { PluginProps } from "white-web-sdk";
import { reaction, IReactionDisposer } from "mobx";
import "./index.less";
import * as video_plugin from "./image/video_plugin.svg";
import { PluginContext } from "./Plugins";

export type WhiteVideoPluginProps = PluginProps<PluginContext, {
    play: boolean;
    seek: number;
    volume: number;
    mute: boolean;
    currentTime: number;
}>;

export type WhiteVideoPluginStates = {
    mute: boolean;
};

export default class WhiteVideoPluginReplay extends React.Component<WhiteVideoPluginProps, WhiteVideoPluginStates> {

    private readonly reactionPlayDisposer: IReactionDisposer;
    private readonly reactionSeekDisposer: IReactionDisposer;
    private readonly reactionVolumeDisposer: IReactionDisposer;
    private readonly reactionMuteDisposer: IReactionDisposer;
    private readonly reactionReplayPlayingDisposer: IReactionDisposer;
    private readonly player: React.RefObject<HTMLVideoElement>;
    public constructor(props: WhiteVideoPluginProps) {
        super(props);
        this.player = React.createRef();
        this.reactionPlayDisposer = this.startPlayReaction();
        this.reactionSeekDisposer = this.startSeekReaction();
        this.reactionMuteDisposer = this.startMuteTimeReaction();
        this.reactionVolumeDisposer = this.startVolumeReaction();
        this.reactionReplayPlayingDisposer = this.startReplayPlayingReaction();
        this.state = {
            mute: false,
        };
    }

    private startPlayReaction(): IReactionDisposer {
        return reaction(() => {
            return this.props.plugin.attributes.play;
        }, async play => {
            if (play) {
                if (this.player.current) {
                    try {
                        await this.player.current.play();
                    } catch (err) {
                        if (`${err.name}` === "NotAllowedError") {
                            await this.player.current.play();
                        }
                    }
                }
            } else {
                if (this.player.current) {
                    this.player.current.pause();
                }
            }
        });
    }

    private startSeekReaction(): IReactionDisposer {
        return reaction(() => {
            return this.props.plugin.attributes.seek;
        }, seek => {
            if (this.player.current) {
                this.player.current.currentTime = seek;
            }
        });
    }

    private startReplayPlayingReaction(): IReactionDisposer {
        return reaction(() => {
            return this.props.plugin.isPlaying;
        }, async isPlaying => {
            if (isPlaying) {
                if (this.player.current) {
                    try {
                        await this.player.current.play();
                    } catch (err) {
                        if (`${err.name}` === "NotAllowedError") {
                            await this.player.current.play();
                        }
                    }
                }
            } else {
                if (this.player.current) {
                    this.player.current.pause();
                }
            }
        });
    }

    private startVolumeReaction(): IReactionDisposer {
        return reaction(() => {
            return this.props.plugin.attributes.volume;
        }, volume => {
            if (this.player.current) {
                this.player.current.volume = volume;
            }
        });
    }

    public componentWillUnmount(): void {
        this.reactionPlayDisposer();
        this.reactionSeekDisposer();
        this.reactionMuteDisposer();
        this.reactionVolumeDisposer();
        this.reactionReplayPlayingDisposer();
    }

    private startMuteTimeReaction(): IReactionDisposer {
        const { plugin } = this.props;
        return reaction(() => {
            return plugin.attributes.mute;
        }, mute => {
            this.setState({ mute: mute });
        });
    }

    private renderNavigation = (): React.ReactNode => {
        const { plugin } = this.props;
        if ((plugin.attributes as any).isNavigationDisable === true) {
            return null;
        } else {
            return (
                <div className="plugin-video-box-nav">
                    <div>
                        <img style={{ width: 20, marginLeft: 8 }} src={video_plugin} />
                        <span>
                            Video Player
                        </span>
                    </div>
                </div>
            );
        }
    }
    public render(): React.ReactNode {
        const { size, plugin, scale} = this.props;
        return (
            <div className="plugin-video-box" style={{ width: (size.width / scale), height: (size.height / scale), transform: `scale(${scale})`}}>
                {this.renderNavigation()}
                <div className="plugin-video-box-body">
                    <div className="white-plugin-video-box">
                        <video webkit-playsinline="true"
                            playsInline
                            poster={(plugin.attributes as any).poster ? (plugin.attributes as any).poster : undefined}
                            className="white-plugin-video"
                            src={(plugin.attributes as any).pluginVideoUrl}
                            ref={this.player}
                            muted={this.state.mute}
                            style={{
                                width: "100%",
                                height: "100%",
                                pointerEvents: "none",
                                outline: "none",
                            }}
                            controls
                            controlsList={"nodownload nofullscreen"}
                            preload="auto"
                        />
                    </div>
                </div>
            </div>
        );
    }
}
