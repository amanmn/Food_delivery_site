
const getDashboard = async (req, res) => {
    res.json({ message: "Welcome to the admin dashboard" });
}   
module.exports = {
    getDashboard
}