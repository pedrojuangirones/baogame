angular.module('baoApp.users',[])

.controller('baoApp.users', function ($scope) {

  $scope.signIn = function (){
      $scope.pageTitle  = 'Sign In' ;
      document.outputForm.outputText.value=document.signInForm.userName.value
              + " : " + document.signInForm.password.value;
  }
}

function register(){
      $scope.pageTitle = 'Register' ;
      document.outputForm.outputText.value="Create New User";
  }

function invite(){
        $scope.pageTitle = 'Invite' ;

    document.outputForm.outputText.value="Invite player: "  +
            document.inviteForm.onlineUsers[document.inviteForm.onlineUsers.selectedIndex].value;
}

function cancelInvite(){
      $scope.pageTitle = 'Cancel Invite' ;
      document.outputForm.outputText.value="Cancel Invite" +
              document.inviteForm.invitesMade[document.inviteForm.invitesMade.selectedIndex].value;;
  }

function blockUser(){
      $scope.pageTitle = 'Block User' ;
      document.outputForm.outputText.value="Block user: " +
         document.inviteForm.onlineUsers[document.inviteForm.onlineUsers.selectedIndex].value;
;
  }


function acceptInvite(){
      $scope.pageTitle = 'Accept' ;
      document.outputForm.outputText.value="Accept invite from user: " +
         document.inviteForm.invitesReceived[document.inviteForm.invitesReceived.selectedIndex].value;
  }

function declineInvite(){
      $scope.pageTitle = 'Decline' ;
      document.outputForm.outputText.value="Decline invite from user: " +
         document.inviteForm.invitesReceived[document.inviteForm.invitesReceived.selectedIndex].value;
  }
