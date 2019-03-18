import React, { Component } from 'react';
import * as UI from '@vkontakte/vkui';
// import * as VKConnect from '@vkontakte/vkui-connect';
import VKConnect from './vkui-connect/promise';
// import VKConnect from 'vkui-connect-promise';
import '@vkontakte/vkui/dist/vkui.css';

export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            actions: {}
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
        ].sort();
    }

    render() {
        return (
            <UI.View activePanel="main">
                <UI.Panel id="main">
                    <UI.PanelHeader>
                        VK Connect Promise Test v0.1.49
                    </UI.PanelHeader>
                    <UI.Group title="Data">
                        <UI.FormLayout>
                            <UI.Textarea id='data' placeholder='{"method": "users.get", "params": {}}' />
                        </UI.FormLayout>
                    </UI.Group>

                    <UI.Group title="Response">
                        <UI.FormLayout>
                            <UI.Textarea id='response' />
                        </UI.FormLayout>
                    </UI.Group>

                    <UI.Group title="Event type">
                        <UI.List>
                            {
                                this.events.map(function(eventName) {
                                    return (
                                        <UI.ListItem onClick={() => {
                                            let data = {};
                                            try {
                                                let input = document.getElementById('data').value;
                                                if (input.length > 0) {
                                                    data = JSON.parse(input);
                                                }

                                                VKConnect.send(eventName, data)
                                                    .then((data) => {
                                                        console.log(data);
                                                        let type = data.type;
                                                        if (['VKWebAppUpdateInfo', 'VKWebAppUpdateInsets', 'VKWebAppUpdateConfig'].indexOf(type) === -1) {
                                                            document.getElementById('response').value = JSON.stringify(data);
                                                        }
                                                    })
                                                    .catch((data) => {
                                                        console.log(data);
                                                        let type = data.type;
                                                        if (['VKWebAppUpdateInfo', 'VKWebAppUpdateInsets', 'VKWebAppUpdateConfig'].indexOf(type) === -1) {
                                                            document.getElementById('response').value = JSON.stringify(data);
                                                        }
                                                    });
                                            } catch(e) {
                                                alert(e);
                                            }
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
