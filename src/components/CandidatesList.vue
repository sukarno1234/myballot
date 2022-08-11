<template>
    <div>
        <div id="header">
            <div style="text-align:right;">
                <v-menu offset-y>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                    v-bind="attrs"
                    v-on="on"
                    fluid style="border:none;background:none;"
                    >
                    {{ accounts[0] }}
                    </v-btn>
                </template>
                <v-list>
                    <v-list-item>
                        <v-list-item-title>
                            <div style="text-align: left;">Balance: <strong>{{ balance }} ETH</strong></div>
                        </v-list-item-title>
                    </v-list-item>
                </v-list>
                </v-menu>
                <button v-if="accounts.length>0" @click="disconnect()" style="background-color:red;">Disconnect</button>
            </div>
        </div>
     

        <v-snackbar
            v-model="snackbar"
            :timeout="5000"
            top
            color="#F44336"
        >
            {{ snackbarText }}
        </v-snackbar>
        <div class="text-center">
            <v-dialog
            persistent
            v-model="dialog"
            width="500"
            >

            <v-card>
                <v-card-title class="text-h5 grey lighten-2">
                Connect to Vote
                </v-card-title>
                <v-container class="grey lighten-5">
                    <v-row no-gutters>
                        <v-col
                            cols="12"
                            sm="12"
                        >
                        <v-text-field
                            v-model="ballotContract"
                            label="Enter Contract"
                            :rules="rules"
                            hide-details="auto"
                        ></v-text-field>   
                        </v-col>
                    </v-row>

                    <v-row no-gutters>
                        <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-row class="ma-4">
                            
                        </v-row>
                            <v-btn
                                fluid style="width: 150px; color: white;"
                                text
                                @click="connectToMetamask()"
                            >
                                CONNECT
                            </v-btn>
                        </v-card-actions>
                    </v-row>
                </v-container>
            </v-card>
            </v-dialog>
        </div>
        <div id="halalan">
            <div class="voteEnabled">
                <button :class="voteEnabled ? 'enabled' : 'disabled'">{{votingStatus}}</button>
            </div>
            <div>
                <h1>HALALAN 2022</h1>
            </div>
        </div>
        <div class="container">  
            <v-simple-table>
                <template v-slot:default>
                    <thead>
                        <tr>
                        <th colspan="3">
                            <h1>Choose a Candidate</h1>
                        </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(candidates, index) in candidates" :key="index" class="candidate-card" >
                            <td v-for="(candidate, index) in candidates" :key="index">
                                <img :src="candidate.image" height="100">
                                <div>Name: <strong>{{candidate.name}}</strong></div>
                                <div>Votes: <strong>{{candidate.voteCount}}</strong></div>
                                <button @click="addVote(index, candidate.name)">Vote</button>
                            </td>
                        </tr>
                    </tbody>
                </template>
            </v-simple-table>
        </div>
    </div>
</template>

<script>
import { ethers, utils} from 'ethers';
import ballotAbi from "../contract-abis/ballot.json";

export default {
    mounted() {
        if(this.ballotContract === null)
        {
            this.dialog = true;
        }
    },
    data() {
        return {
            voteEnabled: false,
            votingStatus: '',
            rules: [
                value => !!value || 'Required.',
            ],
            ballotContract: null,
            dialog: false,
            snackbar: false,
            snackbarText: null,
            errorMessage: 0,
            candidates: [],
            candidatesLength: 0,
            contract: null,
            message: 'Hello VueJS!',
            numVariable: 10,
            boolVariable: true,
            candidate: {
                name: '',
                voteCount: 0
            },
            provider: null,
            accounts: [],
            balance: 0,
        }        
    },
    methods: {
        disconnect() {
            this.$swal({
                title: 'Disconnect?',
                text: "Message Prompt",
                icon: 'info',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes'
                }).then((result) => {
                if (result.isConfirmed) {
                    this.accounts = [];
                    this.balance = 0;
                    this.provices = [];
                    this.contract = [];
                    this.candidates = [],
                    this.candidatesLength = 0;
                    this.ballotContract = null;
                    this.dialog = true;
                }
            });
        },
        async getCandidates() {
            let candidates = [];
            this.candidates = [];
            this.candidatesLength = await this.contract.getCandidatesLength();
            let cols = 3;
            let counter = 0;

            for (let i = 0; i < this.candidatesLength; i++) {
                let candidate = await this.contract.candidates(i);
                let _candidate =  {
                    name: candidate.name,
                    voteCount: candidate.voteCount,
                    image: "https://avatars.dicebear.com/api/avataaars/" + candidate.name + '.svg'
                }
                candidates.push(_candidate);
                counter++;
                if(cols==counter || i == this.candidatesLength-1) {
                    this.candidates.push(candidates);
                    candidates = [];
                    counter=0;
                }
            }

            // let isVotingEnabled = await this.contract.votingEnabled();
            // console.log(isVotingEnabled);
            // if(isVotingEnabled)
            // {
            //     this.voteEnabled = true;
            //     this.votingStatus = "ENABLED";
            // }
            // else
            // {
            //     this.voteEnabled = false;
            //     this.votingStatus = "DISABLED";
            // } 
            
        },
        async addVote(candidateIndex, candidate) {
            this.$swal({
            title: 'Vote for ' + candidate + '?',
            text: "Are you sure you want to vote for this candidate?",
            icon: 'questoion',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes'
            }).then(async (result) => {
            if (result.isConfirmed) {
                let signer = this.provider.getSigner();
                let contractWithSigner = this.contract.connect(signer);
                let transaction = await contractWithSigner.vote(candidateIndex);
                await transaction.wait()
                this.getCandidates()   
                this.errorMessage = '';
            }
            }).catch(error => {
                this.errorMessage = error.data.message;
                this.snackbar = true;
                this.snackbarText = this.errorMessage;
            });
            // this.candidate.voteCount = this.votePlusOne();
        },
        // votePlusOne() {
        //     return this.candidate.voteCount + 1;
        // },
        createContractInstance() {
            this.contract = new ethers.Contract(
                    this.ballotContract, 
                    ballotAbi
                );
            this.contract = this.contract.connect(this.provider);
            
            this.getCandidates();
            this.isVotingEnabled();
        },
        async isVotingEnabled() {
            let signer = this.provider.getSigner();
            let contractWithSigner = this.contract.connect(signer);
            let isVotingEnabled = await contractWithSigner.votingEnabled();

            if(isVotingEnabled)
            {
                this.voteEnabled = true;
                this.votingStatus = "ENABLED";
            }
            else
            {
                this.voteEnabled = false;
                this.votingStatus = "DISABLED";
            } 
        },
        async connectToMetamask() {
            if(this.ballotContract!=null)
            {
                this.provider = new ethers.providers.Web3Provider(window.ethereum);
                this.accounts = await this.provider.send('eth_requestAccounts', []);
        
                this.createContractInstance();
                this.getBalance();
            }
            else
            {
                this.snackbar = true;
                this.snackbarText = "Please enter Ballot Contract";
            }
            
            if(this.accounts.length > 0)
            {
                this.dialog = false;
            }
            else if (this.accounts.length === 0)
            {
                this.dialog = true;
            }
        },
        async getBalance() {
            let rawBalance = await this.provider.getBalance(this.accounts[0]);
            this.balance = utils.formatEther(rawBalance);
        },
        // async dial() {
        //     let res = await this.$dialog.prompt({
        //                 text: 'Please input your name',
        //                 title: 'Title'
        //                 })
        //                 if (res) {
        //                 this.$dialog.notify.info('Your name is ' + res)
        //     }
        // }
    }
}
</script>
<style scoped>
.v-data-table__wrapper > table > tbody > tr:hover {
  background: inherit !important;
}
.enabled {
    background-color: rgb(15, 226, 15);
}

.disabled {
    background-color: rgb(255, 0, 0);
}

.voteEnabled {
    position: absolute;

}
button {
    color: white;
    background-color: blue;
    padding: 10px 20px;
    margin: 5px;
    border: none;
    border-radius: 5px;
}
button:active {
    background-color: darkgreen;
}
.large-text {
    font-size: 25px;
}
.candidate-card {
    margin: 10px;
    padding: 5px;
    border: 1px solid black;
}
</style>