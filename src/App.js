import React, { Component } from 'react';
import * as UI from '@vkontakte/vkui';
import VKConnect from '@vkontakte/vkui-connect-promise';
// import VKConnect from './vkui-connect/promise';
import '@vkontakte/vkui/dist/vkui.css';

let APP_ID = 6909581;
let query = {};
if (window.location.search) {
    window.location.search.slice(1).split('&').forEach((item) => {
        const [key, value] = item.split('=');
        query[key] = value;
    });
}
if (Object.keys(query) && query['vk_app_id']) {
    APP_ID = query['vk_app_id'];
}

const isClient = typeof window !== 'undefined';
const androidBridge = isClient && window.AndroidBridge;
const iosBridge = isClient && window.webkit && window.webkit.messageHandlers;
const isWeb = !androidBridge && !iosBridge;

// ucs-2 string to base64 encoded ascii
const utoa = (str) => window.btoa(unescape(encodeURIComponent(str)));
// base64 encoded ascii to ucs-2 string
const atou = (str) => decodeURIComponent(escape(window.atob(str)));


export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            eventData: '{"method": "users.get", "params": {}}',
            eventName: 'VKWebAppGetUserInfo',
            eventValid: true,
        };

        this.events = [
            "VKWebAppAddToCommunity",
            "VKWebAppAddToFavorites",
            "VKWebAppAllowMessagesFromGroup",
            "VKWebAppAllowNotifications",
            "VKWebAppAudioGetStatus",
            "VKWebAppAudioPause",
            "VKWebAppAudioPlay",
            "VKWebAppAudioSetPosition",
            "VKWebAppAudioStop",
            "VKWebAppAudioUnpause",
            "VKWebAppCallAPIMethod",
            "VKWebAppClose",
            "VKWebAppDenyNotifications",
            "VKWebAppFlashGetInfo",
            "VKWebAppFlashSetLevel",
            "VKWebAppGameInstalled",
            "VKWebAppGetAuthToken",
            "VKWebAppGetClientVersion",
            "VKWebAppGetCommunityAuthToken",
            "VKWebAppGetEmail",
            "VKWebAppGetFriends",
            "VKWebAppGetGeodata",
            "VKWebAppGetPersonalCard",
            "VKWebAppGetPhoneNumber",
            "VKWebAppGetUserInfo",
            "VKWebAppInit",
            "VKWebAppJoinGroup",
            "VKWebAppOpenApp",
            "VKWebAppOpenCodeReader",
            "VKWebAppOpenContacts",
            "VKWebAppOpenPayForm",
            "VKWebAppOpenQR",
            "VKWebAppResizeWindow",
            "VKWebAppScroll",
            "VKWebAppSendPayload",
            "VKWebAppSetLocation",
            "VKWebAppSetPaymentToken",
            "VKWebAppSetViewSettings",
            "VKWebAppShare",
            "VKWebAppShowCommunityWidgetPreviewBox",
            "VKWebAppShowImages",
            "VKWebAppShowMessageBox",
            "VKWebAppShowWallPostBox",
            "VKWebAppTapticImpactOccurred",
            "VKWebAppTapticNotificationOccurred",
            "VKWebAppTapticSelectionChanged",
        ].sort();
    }

    setData = (data, type) => {
        if (['VKWebAppUpdateInfo', 'VKWebAppUpdateInsets', 'VKWebAppUpdateConfig'].indexOf(type) === -1 &&
            !(type === 'VKWebAppSetLocationResult' && data.data.hasOwnProperty('request_id') && data.data.request_id === 'customsetlocationevent')) {
            document.getElementById('response').value = JSON.stringify(data);
        }
    }

    copyToClipboard(str) {
        const el = document.createElement('textarea');
        el.value = str;
        el.setAttribute('readonly', '');
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        const selected =
            document.getSelection().rangeCount > 0 ?
            document.getSelection().getRangeAt(0) :
            false;
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        if (selected) {
            document.getSelection().removeAllRanges();
            document.getSelection().addRange(selected);
        }
    }

    componentDidMount() {
        const hash = window.location.hash;
        if (hash) {
            const params = atou(hash.slice(1).replace('%3D', '=')).split('@');
            if (params.length === 2) {
                this.setState({
                    eventName: params[0],
                    eventValid: isWeb ? ~this.events.indexOf(params[0]) : VKConnect.supports(params[0]),
                    eventData: params[1],
                });
            }
        }

        VKConnect.subscribe((e) => {
            console.log('Event subscribe: \n', e);
        });
    }

    render() {
        console.log(this.state)
        return (
            <UI.View activePanel="main">
                <UI.Panel id="main">
                    <UI.PanelHeader>
                        VK Connect Test App v0.2.26
                    </UI.PanelHeader>

                    <UI.Group title="Response">
                        <UI.FormLayout>
                            <UI.Textarea id='response' />
                        </UI.FormLayout>
                    </UI.Group>

                    <UI.Group title="VK Connect Event">
                        <UI.FormLayout>
                            <UI.Input
                                top="Event type"
                                id='custom_event'
                                type="text"
                                defaultValue={this.state.eventName}
                                status={this.state.eventValid ? 'valid' : 'error'}
                                bottom={this.state.eventValid ? '' : 'Invalid VK Connect event type'}
                            />
                            <UI.Textarea
                                top="Event params"
                                id='data'
                                // placeholder='{"method": "users.get", "params": {}}'
                                defaultValue={this.state.eventData}
                            />
                            <UI.Div style={{ display: 'flex', padding: 0 }}>
                                <UI.Button size="xl" stretched style={{ marginRight: 8 }} level="commerce" onClick={() => {
                                    let data = {};
                                    try {
                                        let input = document.getElementById('data').value;
                                        let eventName = document.getElementById('custom_event').value;
                                        const isValidEvent = isWeb ? ~this.events.indexOf(eventName) : VKConnect.supports(eventName);
                                        if (input.length > 0) {
                                            data = JSON.parse(input);
                                        }
                                        if (isValidEvent) {
                                            this.setState({
                                                eventName,
                                                eventValid: isValidEvent,
                                                eventData: data,
                                            });
                                            VKConnect.send(eventName, data)
                                                .then((data) => {
                                                    console.log(data);
                                                    let type = data.type;
                                                    this.setData(data, type);
                                                })
                                                .catch((data) => {
                                                    let type = data.type;
                                                    this.setData(data, type);
                                                });
                                            VKConnect.send('VKWebAppSetLocation', {
                                                location: utoa(`${eventName}@${input}`),
                                                request_id: 'customsetlocationevent',
                                            })
                                                .then((data) => {
                                                    console.log(data);
                                                    let type = data.type;
                                                    this.setData(data, type);
                                                })
                                                .catch((data) => {
                                                    console.log(data);
                                                    let type = data.type;
                                                    this.setData(data, type);
                                                });
                                        } else {
                                            this.setState({
                                                eventName,
                                                eventValid: isValidEvent,
                                                eventData: input,
                                            });
                                        }
                                    } catch(e) {
                                        alert(e);
                                    }
                                }}>Send Event</UI.Button>
                                <UI.Button size="xl" stretched level="secondary" onClick={() => {
                                    const input = document.getElementById('data').value;
                                    const eventName = document.getElementById('custom_event').value;
                                    const link = `https://vk.com/app${APP_ID}#${utoa(`${eventName}@${input}`)}`;
                                    this.copyToClipboard(link);
                                }}>Copy Link</UI.Button>
                            </UI.Div>
                        </UI.FormLayout>
                    </UI.Group>

                    <UI.Group title="Select event type">
                        <UI.List>
                            {
                                this.events.map(function(eventName) {
                                    return (
                                        <UI.ListItem onClick={() => {
                                            let input = document.getElementById('custom_event');
                                            input.value = eventName;
                                        }
                                        }>
                                            {eventName}
                                        </UI.ListItem>
                                    );
                                })
                            }
                        </UI.List>
                    </UI.Group>
                </UI.Panel>
            </UI.View>
        );
    }
}
