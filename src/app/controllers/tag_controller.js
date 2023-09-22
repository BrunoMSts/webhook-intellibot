function tagController(req, res) {

  //REFATORAR LOGICA DAS TAGS

  if(req.body.fulfillmentInfo?.tag === "jenkinsUrl") {
    jenkinsURL = req.body.sessionInfo.parameters.jenkinsurl
    res.json({})
  }

  if(req.body.fulfillmentInfo?.tag === "login") {
    config.auth.username = req.body.text
    res.json({})
  }

  if(req.body.fulfillmentInfo?.tag === "senha") {
    config.auth.password = req.body.text
    res.json({})
  }

  if(req.body.fulfillmentInfo?.tag === "jobName") {
    jobName = req.body.text
    res.json({})
  }

  if(req.body.fulfillmentInfo?.tag === "sonarURL") {
    sonarQubeURL = req.body.text
    res.json({})
  }

  if(req.body.fulfillmentInfo?.tag === "sonarToken") {
    config.sonarAuth.token = req.body.text
    res.json({})
  }

  if(req.body.fulfillmentInfo?.tag === "sonarProject") {
    sonarProjectName = req.body.text
    isUsingSonar = true
    res.json({})
  }
}

module.exports = {
  tagController
}