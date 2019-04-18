import React, { Component } from 'react';
import * as UI from '@vkontakte/vkui';
import VKConnect from '@vkontakte/vkui-connect-promise';
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


export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            eventData: '{"method": "users.get", "params": {}}',
            eventName: 'VKWebAppGetUserInfo',
            eventValid: true,
        };

        this.events = [
            "VKWebAppGetAuthToken",
            "VKWebAppCallAPIMethod",
            "VKWebAppAddToCommunity",
            "VKWebAppGetGeodata",
            "VKWebAppGetUserInfo",
            "VKWebAppGetPhoneNumber",
            "VKWebAppGetClientVersion",
            "VKWebAppGetCommunityAuthToken",
            "VKWebAppOpenPayForm",
            "VKWebAppShare",
            "VKWebAppAllowNotifications",
            "VKWebAppDenyNotifications",
            "VKWebAppShowWallPostBox",
            "VKWebAppGetEmail",
            "VKWebAppAllowMessagesFromGroup",
            "VKWebAppJoinGroup",
            "VKWebAppOpenApp",
            "VKWebAppOpenQR",
            "VKWebAppSetViewSettings",
            "VKWebAppSetLocation",
            "VKWebAppScroll",
            "VKWebAppResizeWindow",
            "VKWebAppClose",
            "VKWebAppSendPayload",
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

    componentWillMount() {
        const hash = window.location.hash;
        if (hash) {
            const params = atob(hash.slice(1).replace('%3D', '=')).split('@');
            if (params.length === 2) {
                this.setState({
                    eventName: params[0],
                    eventValid: isWeb ? ~this.events.indexOf(params[0]) : VKConnect.supports(params[0]),
                    eventData: params[1],
                });
            }
        }
        console.log(isWeb)
    }

    render() {
        console.log(this.state)
        return (
            <UI.View activePanel="main">
                <UI.Panel id="main">
                    <UI.PanelHeader>
                        VK Connect Test App v0.1.5
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
                                                location: btoa(`${eventName}@${input}`),
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
                                    const link = `https://vk.com/app${APP_ID}#${btoa(`${eventName}@${input}`)}`;
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