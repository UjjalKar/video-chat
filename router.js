const router = require("express").Router();
const Call = require("./call");

router.get("/", (req, res) => {
  res.render("pages/home");
});

router.get("/new", (req, res) => {
  let call = Call.create();
  res.redirect(`/${call.id}`);
  // res.json(call);
});

router.get("/:id", (req, res) => {
  const call = Call.get(req.params.id);
  // if (!call) return res.status(404).json({ message: "Call not found!" });
  if (!call) return res.redirect("/new");
  console.log(call.toJSON());
  res.render("pages/call", {
    call: call.toJSON(),
  });
});

router.get("/:id.json", (req, res) => {
  const call = Call.get(req.params.id);
  if (!call) return res.status(404).json({ message: "Call not found!" });
  res.json({ call: call.toJSON() });
});

router.post("/:id/addpeer/:peerid", (req, res) => {
  let call = Call.get(req.params.id);
  if (!call) return res.status(404).json({ message: "Call not found" });
  call.addPeer(req.params.peerid);
  res.json(call.toJSON());
});

router.post("/:id/removepeer/:peerid", (req, res) => {
  let call = Call.get(req.params.id);
  if (!call) return res.status(404).json({ message: "Call not found" });
  call.removePeer(req.params.id);
  res.json(call.toJSON());
});

module.exports = router;
