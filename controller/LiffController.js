const lineConfig = require("../config/lineConfig");

module.exports = {
    liff_id: (req, res) => {
        res.json({
            id: lineConfig.liff_id
        });
    }
}