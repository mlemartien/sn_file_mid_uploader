var JCL_FileUploader = Class.create();

JCL_FileUploader.prototype = {

    initialize: function() {

        // Set up the Packages references

        this.File = Packages.java.io.File;
        this.HttpClient = Packages.org.apache.commons.httpclient.HttpClient;
        this.UsernamePasswordCredentials = Packages.org.apache.commons.httpclient.UsernamePasswordCredentials;
        this.AuthScope = Packages.org.apache.commons.httpclient.auth.AuthScope;
        this.PostMethod = Packages.org.apache.commons.httpclient.methods.PostMethod;
        this.MultipartRequestEntity = Packages.org.apache.commons.httpclient.methods.multipart.MultipartRequestEntity;
        this.FilePart = Packages.org.apache.commons.httpclient.methods.multipart.FilePart;
        this.Part = Packages.org.apache.commons.httpclient.methods.multipart.Part;
        this.StringPart = Packages.org.apache.commons.httpclient.methods.multipart.StringPart;

        // Get the parameters from the caller

        this.verbose = probe.getParameter('verbose');
        this.instance = probe.getParameter('instance');
        this.fileLocation = probe.getParameter('fileLocation');
        this.fileName = probe.getParameter('fileName');
        this.tableName = probe.getParameter('tableName');
        this.documentId = probe.getParameter('documentId');

    },

    midLog: function(message) {
        if (this.verbose == 'true') {
            ms.log('JCL_FileUploader | ' + message);
        }
    },
    
    execute: function() {

        // Setting some base data to run this function

        var apiEndPoint = 'https://' + this.instance + '/api/now/attachment/upload';
        var localFileFullName = this.fileLocation + '/' + this.fileName;
        var apiUserName = ms.getConfigParameter('mid.instance.username');
        var apiUserPassword = ms.getConfigParameter('mid.instance.password');

        // Set up the HTTP Connection

        var client = new this.HttpClient();

        // Construct credentials

        var authScope = new this.AuthScope(this.instance, '443', null);
        var credentials = new this.UsernamePasswordCredentials(apiUserName, apiUserPassword);
        this.midLog('Using user ' + apiUserName + ' to connect to ' + apiEndPoint);
        client.getState().setCredentials(authScope, credentials);

        // Create the POST REST request

        var post = new this.PostMethod(apiEndPoint);
        post.setDoAuthentication(true);

        // Construct parameters for the file to upload and the attachment destination

        var parts = [];
        parts.push(new this.StringPart('table_name', this.tableName));
        parts.push(new this.StringPart('table_sys_id', this.documentId));

        try {

            var file = new this.File(localFileFullName);
            if (file.exists()) {
                parts.push(new this.FilePart(file.getName(), file));
            }

        } catch (ex) {

            this.midLog('Error | Could not locate file ' + localFileFullName + '(' + ex.message + ')');

        }

        var entity = new this.MultipartRequestEntity(parts, post.getParams());
        post.setRequestEntity(entity);

        // Ready to execute the REST call

        try {

            postStatus = client.executeMethod(post);

            if (postStatus == 201) {
                this.midLog('Info | Successfully uploaded file ' + localFileFullName);
            } else {
                this.midLog('Error | Could not upload file ' + localFileFullName + '. Error http ' + postStatus);
            }

        } catch (ex) {

            this.midLog('Error | Could not upload file ' + localFileFullName + '. Exception occurred in posting: ' + ex.message);

        }

	},

    type: 'JCL_FileUploader'
};
