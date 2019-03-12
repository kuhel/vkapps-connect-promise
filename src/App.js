import React, { Component } from 'react';
import * as UI from '@vkontakte/vkui';
import * as VKConnect from '@vkontakte/vkui-connect';
// import * as VKConnect from './vkui-connect/desktop';
// import * as VKConnect from '@vkontakte/vkui-connect-desktop';
import '@vkontakte/vkui/dist/vkui.css';
import {fetch as fetchPolyfill} from 'whatwg-fetch';

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

        this.onService = this.onService.bind(this);
        this.onServiceNew = this.onServiceNew.bind(this);
        this.onGroup = this.onGroup.bind(this);
        this.onUser = this.onUser.bind(this);
    }

    componentWillMount() {
        VKConnect.subscribe(function(e) {
            e = e.detail;
            let type = e['type'];
            if (['VKWebAppUpdateInfo', 'VKWebAppUpdateInsets', 'VKWebAppUpdateConfig'].indexOf(type) === -1) {
                document.getElementById('response').value = JSON.stringify(e);
            }
        });
    }

    componentDidMount() {
        fetchPolyfill('https://extype.ru/sandbox/api.php?recipient=service')
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            this.setState({
                actions: { ...data },
            });
        });
    }

    onService() {
        if (this.state.actions.service) {
            VKConnect.send('VKWebAppOpenPayForm', {"app_id": 6695435, "action": "pay-to-service", "params": this.state.actions.service});
        }
    }

    onServiceNew() {
        if (this.state.actions.service_new) {
            VKConnect.send('VKWebAppOpenPayForm', {"app_id": 6695435, "action": "pay-to-service", "params": this.state.actions.service_new});
        }
    }

    onGroup() {
        if (this.state.actions.group) {
            VKConnect.send('VKWebAppOpenPayForm', {"app_id": 6695435, "action": "pay-to-group", "params": this.state.actions.group});
        }
    }

    onUser() {
        if (this.state.actions.user) {
            VKConnect.send('VKWebAppOpenPayForm', {"app_id": 6695435, "action": "pay-to-user", "params": this.state.actions.user});
        }
    }

    render() {
        return (
            <UI.View activePanel="main">
                <UI.Panel id="main">
                    <UI.PanelHeader>
                        VK Connect Test v2.1.0
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

                    <UI.Group title="Pay To">
                        <UI.List>
                            <UI.ListItem onClick={this.onService}>
                                Pay To Service
                            </UI.ListItem>
                            <UI.ListItem onClick={this.onServiceNew}>
                                Pay To Service New
                            </UI.ListItem>
                            <UI.ListItem onClick={this.onGroup}>
                                Pay To Group
                            </UI.ListItem>
                            <UI.ListItem onClick={this.onUser}>
                                Pay To User
                            </UI.ListItem>
                        </UI.List>
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

                                                VKConnect.send(eventName, data);
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
