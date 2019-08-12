//     Description    Flame smanage JavaScript 
//
//     Authors:       Marc Serret i Garcia (marcserret@live.com)
// 
//     Copyright 2018 Marc Serret i Garcia
// 
//     This file is part of Flame
// 
//     Flame is free software: you can redistribute it and/or modify
//     it under the terms of the GNU General Public License as published by
//     the Free Software Foundation version 3.
// 
//     Flame is distributed in the hope that it will be useful,
//     but WITHOUT ANY WARRANTY; without even the implied warranty of
//     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//     GNU General Public License for more details.
// 
//     You should have received a copy of the GNU General Public License
//     along with Flame. If not, see <http://www.gnu.org/licenses/>.

//TODO: Remove all development console logs and alerts.


var selectspace;
function viewFullInfo() {
    var space = $("#space option:selected").text();

    $.post('/showInfo', { "space": space })


        .done(function (results) {
            console.log(results);
        });
}


/**
 * @summary. Hide all forms
 * @description. Hide the forms when you click on a form 
 * 
 */
function hideAll() {
    $("#importForm").hide("fast");
    $("#addForm").hide("fast");
}

/**
 * @summary. Display the add new space form
 * @description. First hide all forms calling hideAll and display the add new space form
 * 
 */
function displayNewspaceForm() {
    $('#add').click(function () {
        hideAll();
        $("#addForm").toggle("fast");
    });
}

/**
 * @summary. Display the import space form
 * @description. First hide all forms calling hideAll and display the import space form
 * 
 */
function displayImportspaceForm() {
    $('#import').click(function () {
        hideAll();
        $("#importForm").toggle("fast")
    });
}

// simple utility function to download as a file text generated here (client-side)
function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

/**
 * @summary. Checks if a string is alphanumeric
 * @description. Check if a string is alphanumeric using a regex
 * @param {string} name String to check 
 * 
 * @returns {boolean} true if string is alphanumeric or false otherwise
 */
function alphanumericChecker(name) {
    var letters = /^[A-Za-z0-9]+$/;
    if (name.match(letters)) {
        return true;
    }
    else {
        return false;
    }
}

/**
 * @summary. Check if a space exists
 * @description. check if a space exists calling /dir function
 * @param {string} space String to check 
 * 
 * @returns {boolean} true if space exists or false otherwise
 */
function spaceExists(space) {
    console.log(space);
    $.get('/dir', function (result) {
        console.log("im in get");
        //console.log(result)
        parsedResult = JSON.parse(result);
        //console.log(parsedResult);
        for (name in parsedResult) {
            //console.log(parsedResult[name][0]+"/"+space);
            if (space === parsedResult[name][0]) {
                return true;
            }
        }
        return false;
    });
    //return false;
}

/**
 * @summary. Add a space.
 * @description. Add a space and check if it exists and if it is alphanumeric.
 * Depending on the result it shows a message or another.
 * If all is correct the combobox are reloaded to show the new element.
 */
function addspace() {
    var name = $("#name").val(); // value from input
    if (alphanumericChecker(name)) {   // passes check
        if (/*spaceExists(name)===false*/true) {    //TODO repair spaceExists func, it returns undefinded
            $.post('/addspace', { "space": name })
                .done(function (result) {
                    doneModal();
                    loadTree();
                    hideAll();
                }).fail(function (result) {   // !!! Say that fails but it works 
                    modalError(result)
                });
            
        } else {
        }
    } else {
        doneModal("Name must be alphanumeric");
    }
}
/**
 * @summary: 
 */
function uploadspace() {
    var ifile = document.getElementById("uploadfile").files[0];
    if (upload(ifile, '', importspace) == false) {
        $("#data-console").text("unable to upload file, similarity search aborted...");
        return;
    };
}


function importspace(temp_dir, name) {
    $.post('/importspace', { "space": name })
        .always(function (result) {
            doneModal();
            loadTree();
            hideAll();
        });

}

/**
 * @summary. Shows a confirm dialog
 * @description. Shows a confirm dialog with a message
 * @param {string} msg message to display 
 * @param {string} space space to display in the message 
 *
 * @returns {boolean} true if user confirms or false otherwise
 */
function confDialog(msg, space) {
    var question = msg + ": " + space + "?";
    if (confirm(question)) {
        return true;
    } else {
        return false;
    }
}

/**
 * @summary. Remove all space family
 * @description. First check if the space that the user wants to remove exists (to prevent DOM modifications), if exists 
 * the app shows a confirm dialog and if the user really wants to delete the family the family is removed.
 * Show the transaction results and updates the main tree
 */
function deleteFamily() {
    var space = $("#hiddenInput").val(); // value from input
    var spaceChild = $("#hiddenInputChild").val(); // value from input
    if (/*spaceExists(space)*/true) {    //TODO repair spaceExists func, it returns undefinded
        $.post('/deleteFamily', { "space": space })
            .done(function (result) {
                console.log(result);
                doneModal();
                loadTree();
                resetTable();
            })
            .fail(function (result){
                modalError(result);
            }); 

        console.log("Family removed");
    }
    else {
        console.log("The space doesnt exist, please update the page");

    }
}

/**
 * @summary. Remove the selected version
 * @description. Shows a confirm dialog and if the user confirm the selected space version is removed.
 * When the transaction is completed it shows the result to the user and relaod the main tree.
 */
function deleteVersion() {
    var space = $("#hiddenInput").val(); // value from input
    var spaceChild = $("#hiddenInputChild").val(); // value from input
    $.post('/deleteVersion', { "space": space, "version": spaceChild })
        .done(function (result) {
            doneModal();
            loadTree();
            expandNode();
            resetTable();
        })
        .fail(function (result){
            modalError(result);
        });
}
/**
 * @summary. Reset the details table
 */
function resetTable() {
    $("#tBody").empty();
    $("#tBody").append("<tr><td>None selected</td></tr>");
    $("#smanage").text("None selected");
    $("#details").text("Select a space version");
}

/**
 * @summary. Clone the selected space
 * @description. Shows a confirm dialog and if the user confirm the selected space is cloned
 * When the transaction is completed it shows the result to the user and relaod the main tree.
 */
function clonespace() {
    var space = $("#hiddenInput").val(); // value from input
    $.post('/clonespace', { "space": space })
        .done(function (result) {
            doneModal();
            loadTree();
            expandNode();
        })
        .fail(function(result){
            modalError(result);
        });
}

/**
 * @summary. Loads the main tree
 * @description. Loads the main tree with the option provided in the constructor
 */
function loadTree() {
    $.get('/dir').done(function (result) {
        result = JSON.parse(result);
        $('#tree').treeview({
            color: undefined,
            onhoverColor: '#edba74',
            selectedBackColor: "#e59d22",
            expandIcon: 'fas fa-plus',
            collapseIcon: 'fas fa-minus',
            backColor: '#f8f9fa',
            borderColor: '#dfe0e1',
            levels: 0,
            data: result
        });
        selectedNode();
        $("#tree ul").addClass("list-group-flush");
        $(".list-group-item").css("font", "bold");
    });
}

/**
 * @summary. Expand all tree nodes
 */
function expandTree() {
    $("#tree").treeview("expandAll", { silent: true });
}

/**
 * @summary. Collapse all tree nodes
 */
function collapseTree() {
    $('#tree').treeview('collapseAll', { silent: true });

}

/**
 * @summary. Expand the seleted node
 */
function expandNode() {
    $('#tree').treeview('expandNode', [selectspace.nodeId, { levels: 2, silent: true }]);
}

/**
 * @summary. Clone the selected space
 * @description. Shows a confirm dialog and if the user confirm the selected space is cloned
 * When the transaction is completed it shows the result to the user and relaod the main tree.
 */
function selectedNode() {
    var query;
    $("#tree").on('nodeSelected', function (getSel, data) {
        parentNode = $('#tree').treeview('getParent', data);
        $("#exportBTN").removeClass("disabled");
        $("#cloneBTN").attr("disabled", false);
        $("#deletespaceBTN").attr("disabled", false);

        // Check if the node selected is father or child
        if (typeof parentNode.text !== 'string') {     //father selected
            selectspace = data;
            //Set all texts
            $("#details").text(data.text);
            $("#smanage").text(data.text);
            //Disable delete version button cuz a father is selected
            $("#deleteVersionBTN").attr("disabled", true);
            //Set hidden inputs
            $("#hiddenInputChild").val("");
            $("#hiddenInput").val(data.text);
            //Set the main table 
            $("#tBody").empty();
            $("#tBody").append("<tr><td>Select a version</td></tr>");
            //Sets the url to launch when the export button is pressed
            query = "exportspace?space=" + data.text;
            //document.getElementById("exportBTN").setAttribute("href", query);
            loadCombos(data.text);
        } else {                                      //child selected
            selectspace = parentNode;
            //Set all text
            $("#details").text(parentNode.text + "." + data.text);
            $("#smanage").text(parentNode.text + "." + data.text);
            //Enable delete version button cuz a child is selected
            $("#deleteVersionBTN").attr("disabled", false);
            //Set hidden inputs
            $("#hiddenInput").val(parentNode.text);
            $("#hiddenInputChild").val(data.text);
            //Sets the url to launch when the export button is pressed
            query = "exportspace?space=" + parentNode.text;
            //document.getElementById("exportBTN").setAttribute("href", query); 
            //Load the main table 
            getInfo();
            // $("#smanage").addClass("border");
            // $("#smanage").addClass("rounded");
            loadCombos(parentNode.text, data.text);
        }
        return data;
    });
}

/**
 * @summary. Get the version details
 * @description. Get the version details and print the result in table format.
 * If the result is empty it informs the user about the error
 */
function getInfo() {
    $("#tBody").empty();
    var space = $("#hiddenInput").val();
    var version = $("#hiddenInputChild").val();
    $.post('/spaceInfo', { "space": space, "version": version})
        .done(function (result) {
            try {
                result = JSON.parse(result);
                var len = result.length;
                for (var i = 0; i < len; i++) {

                    val = result[i][2];
                    if (isFloat(val)) {
                        val = parseFloat(val).toFixed(3);
                    }
                    // $("#tBody").append("<tr class='tElement' ><td data-toggle='tooltip' data-placement='top' title='" 
                    //                     + result[i][1] + "'>" 
                    //                     + result[i][0] + "</td><td>" 
                    //                     + val + "</td></tr>");
                    $("#tBody").append("<tr class='tElement' ><td class='cssToolTip'>"
                        + result[i][0] + "<span>"
                        + result[i][1] + "</span></td><td>"
                        + val + "</td></tr>");

                }
            } catch(err){
                $("#tBody").append("<tr><td>No info provided with this version</td></tr>");
            }

        })
        .fail(function(result){
            modalError(result);
            console.log(result);
        });
            
}

/**
 * @summary: Generate the modal and show it
 * @description: Generate the modal including the text, title and function to call when the yes button is pressed
 * @param {string} title modal ttle
 * @param {string} text modal text
 * @param {string} func function to call   
 */
function generateModal(title, text, func) {
    var modal = "<div class='modal fade' id='exampleModal' tabindex='-1' role='dialog' aria-labelledby='exampleModalLabel' aria-hidden='true'> \
    <div class='modal-dialog' role='document'> \
      <div class='modal-content'> \
        <div class='modal-header'> \
          <h5 class='modal-title' id='exampleModalLabel'>"+ title + "</h5> \
          <button type='button' class='close' data-dismiss='modal' aria-label='Close'> \
            <span aria-hidden='true'>&times;</span> \
          </button> \
        </div> \
        <div class='modal-body' id='modalBody'> \
          "+ text + " \
        </div> \
        <div class='modal-footer'> \
          <button type='button' class='btn btn-secondary' data-dismiss='modal'>Close</button> \
          <button type='button' id = 'modalYes' class='btn btn-primary' onclick='"+ func + "'>Yes</button> \
        </div> \
      </div> \
    </div> \
  </div>"
    $("#modal").html(modal);
    $("#exampleModal").modal();
    $("#exampleModal").modal('show');
}

function modalError(msg) {
    var modal = "<div class='modal fade' tabindex='-1' role='dialog' id='errorModal'> \
    <div class='modal-dialog'  role = 'document' > \
    <div class='modal-content'> \
        <div class='modal-header'> \
          <h5 class='modal-title'>An error has occurred</h5> \
          <button type='button' class='close' data-dismiss='modal'  \ aria-label='Close'> \
            <span aria-hidden='true'>&times;</span> \
          </button> \
        </div> \
    <div class='modal-body'> \
          <p>Error: "+msg+"</p> \
        </div> \
    <div class='modal-footer'> \
          <button type='button' class='btn btn-secondary' \ data-dismiss='modal'>Close</button> \
        </div > \
      </div > \
    </div > \
  </div > "
  $("#modal").html(modal);
  $("#errorModal").modal();
  $("#errorModal").modal('show');
}

/**
 * @summary: Show a modal with a message
 * @description: Show a  modal with a message removing te yes button. By default the message is Completed
 * @param {string} msg="Completed" 
 */
function doneModal(msg = "Completed") {
    $("#modalYes").remove();
    $("#modalBody").text(msg);
}
/**
 * @summary: Shows a load animation and exports the selected space
 * @description: Shows a load animation, blurs the page and add a transparent full screen div to prevent the user clicks.
 * When the space is expoted the space is downloaded automaticlly and the animation, the blur and the div dissappears.
 */
function exportspace() {
    var space = $("#hiddenInput").val();
    $("#smanageTab").css("filter", "blur(2px)");
    $(".navbar").css("filter", "blur(2px)");
    $(".nav").css("filter", "blur(2px)");
    $("#nav-search-tab").addClass("disabled");
    $("#exporting").prop('hidden', false);
    $("#overlay").addClass("noClick")
    $.get('/exportspace', { "space": space })
        .always(function (result) {
            $("#overlay").removeClass("noClick")
            $("#exporting").prop('hidden', true);
            $("#nav-search-tab").removeClass("disabled");
            $("#smanageTab").css("filter", "blur(0px)");
            $(".navbar").css("filter", "blur(0px)");
            $(".nav").css("filter", "blur(0px)");
            generateDownloadLink(space);
        })
        .done(function (result){
            doneModal("space exported");
        })
        .fail(function (result){
            modalError(result);
        });
}
/**
 * @summary Generates and clicks an a element to download the exported space 
 * @param {string} space space to download
 */
function generateDownloadLink(space) {
    var element = document.createElement('a');
    element.setAttribute('href', "download?space=" + space);
    element.setAttribute('download', space);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

/**
 * @summary: Activates all button handlers
 * @description: Activates all button handlers and set the text modal, action and title
 */
function buttonClick() {
    $("#cloneBTN").click(function () {
        generateModal("Clone", "Do you want to clone " + $("#hiddenInput").val() + " ?", "clonespace()");
    });
    $("#deleteVersionBTN").click(function () {
        generateModal("Remove version", "Do you want to remove " + $("#hiddenInput").val() + "." + $("#hiddenInputChild").val() + " ? <br> You will not be able to recover the version", "deleteVersion()");
    });
    $("#addE").click(function () {
        generateModal("Add", "Do you want to add " + $("#name").val() + " ? <br> A new space with the given name will be created", "addspace()");
    });
    $("#deletespaceBTN").click(function () {
        generateModal("Remove space", "Do you want to remove " + $("#hiddenInput").val() + " ? <br> You will not be able to recover the space", "deleteFamily()");
    });
    $("#exportBTN").click(function () {
        exportspace();
    });
}
// main
$(document).ready(function () {
    //Reset all inputs
    $("#hiddenInput").val("");
    $("#hiddenInputChild").val("");
    $("#name").val("");
    $("#importLabel").val("");
    //Disable delete version button
    $("#deleteVersionBTN").attr("disabled", true);
    $("#exportBTN").attr("disabled", true);
    $("#cloneBTN").attr("disabled", true);
    $("#cloneBTN").attr("disabled", true);
    $("#deletespaceBTN").attr("disabled", true);
    //Load the main tree
    loadTree();
    //generateTable();
    //Hide all forms
    hideAll();
    // Toggles the forms between hide and show
    displayImportspaceForm();
    displayNewspaceForm();
    //Activate all buttons
    buttonClick();

    $("#uploadfile").on('change', function () {
        file = document.getElementById("uploadfile").files[0];
        $("#impLabel").html(file.name);
        $("#search").prop('disabled', false);
    })

});
