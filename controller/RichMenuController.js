const fs = require('fs');

module.exports = {
    postMenu: (req, res) => {
        const richmenu = {
            size: {
                width: 2500,
                height: 843
            },
            selected: true,
            name: "Shortcut Menu",
            chatBarText: "Tap to open",
            areas: [
                {
                    bounds: {
                        x: 0,
                        y: 0,
                        width: 843,
                        height: 843
                    },
                    action: {
                        type: "postback",
                        "data": JSON.stringify({
                            action: "income"
                        })
                    }
                },
                {
                    bounds: {
                        x: 843,
                        y: 0,
                        width: 843,
                        height: 843
                    },
                    action: {
                        type: "postback",
                        "data": JSON.stringify({
                            action: "expense"
                        })
                    }
                },
                {
                    bounds: {
                        x: 1686,
                        y: 0,
                        width: 843,
                        height: 843
                    },
                    action: {
                        type: "uri",
                        label: "Menu",
                        uri: "https://liff.line.me/1657290312-MbrLVaX4"
                    }
                },
            ]
        };
    
        client.createRichMenu(richmenu)
            .then((richMenuId) => {
                console.log(richMenuId);
                client.setRichMenuImage(richMenuId, fs.createReadStream('./images/menuv1.png'))
                    .then(r => {
                        console.log(r);
                        res.send(200, {
                            "status": "success",
                            "richMenuID": richMenuId,
                            "response": r
                        });
                    })
                    .catch(err => console.error(err))
            })
            .catch(err => console.error(err));
    }
}