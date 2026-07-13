/// <reference path="../pb_data/types.d.ts" />

routerAdd(
  "POST",
  "/api/basingse/tree-hit",
  function (e) {
    var treeUtils = require(__hooks + "/tree_server_utils.js");
    var payload = new DynamicModel({
      resourceId: "",
      id: "",
    });

    try {
      e.bindBody(payload);
    } catch (error) {
      console.log("[TreeHit Debug][route][bind-error]", String(error));
      return e.json(400, {
        success: false,
        error: "INVALID_REQUEST_BODY",
        details: {
          message: String(error),
        },
      });
    }

    var authUserId = e.auth ? e.auth.id : null;
    var incomingBody = null;
    try {
      incomingBody = e.requestInfo().body;
    } catch (error) {
      incomingBody = { error: String(error) };
    }

    var logicalResourceId = payload.resourceId || payload.id || "";
    console.log("[TreeHit Debug][route][request]", JSON.stringify({
      authUserId: authUserId,
      body: incomingBody,
      resourceId: payload.resourceId,
      fallbackId: payload.id,
      logicalResourceId: logicalResourceId,
    }));

    var result = treeUtils.processTreeHit($app, e.auth, logicalResourceId);
    console.log("[TreeHit Debug][route][response]", JSON.stringify({
      authUserId: authUserId,
      logicalResourceId: logicalResourceId,
      status: result.status,
      body: result.body,
    }));
    return e.json(result.status, result.body);
  },
  $apis.requireAuth("users"),
);

cronAdd("tree-respawn-manager", "*/1 * * * *", function () {
  var treeUtils = require(__hooks + "/tree_server_utils.js");
  treeUtils.processDueTreeRespawns($app);
});
