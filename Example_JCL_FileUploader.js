(function() {

    // Create a probe to be sent to the MID Server

    var jspr = new JavascriptProbe('imac_ubuntu');

    // Configure which MID Server Script Include and function to call

    jspr.setName('JCL_FileUploader');
    jspr.setJavascript('var fu = new JCL_FileUploader(); res = fu.execute();');

    // Add the parameters that the MID Server will use
    
    jspr.addParameter('verbose', 'true');
    jspr.addParameter('instance', 'dev68475.service-now.com')
    jspr.addParameter('tableName', 'sys_data_source');
    jspr.addParameter('documentId', '695a8c61970af110c8aff2a3f153af02');
    jspr.addParameter('fileLocation', '/opt/servicenow/mid/agent/uploads');
    jspr.addParameter('fileName', 'locations.csv');

    // Send the request to the MID Server

    jspr.create();

})();
