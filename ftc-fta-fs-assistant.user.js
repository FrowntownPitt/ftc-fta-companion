// ==UserScript==
// @name         FTC FTA/FS assistant
// @version      0.3.2
// @description  Augment the match cycle time with some FS fun stuff
// @author       Austin Frownfelter
// @match        http://localhost/event/*/schedule/
// @match        http://localhost/event/*/practice/
// @match        http://localhost/event/*/reports/cycle/
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    const pageLoadedIdentifier = ".table.table-striped";
    const matchTableRowId = ".table.table-striped tbody tr";
    const red1Selector = `${matchTableRowId} td:nth-child(4)`;
    const red2Selector = `${matchTableRowId} td:nth-child(5)`;
    const blue1Selector = `${matchTableRowId} td:nth-child(6)`;
    const blue2Selector = `${matchTableRowId} td:nth-child(7)`;
    const red1CycleTimeSelector = `${matchTableRowId} td:nth-child(2)`;
    const red2CycleTimeSelector = `${matchTableRowId} td:nth-child(3)`;
    const blue1CycleTimeSelector = `${matchTableRowId} td:nth-child(4)`;
    const blue2CycleTimeSelector = `${matchTableRowId} td:nth-child(5)`;

    const rowCustomStyleClass = 'my-fta';
    const rowSelectedClass = 'row-selected';
    const teamSelectedClass = 'team-selected';
    const teamSelectedOtherClass = 'team-selected-other';

    const styles = {
        highlights: {
            rowSelected: '#fafa3e',
            rowSelectedHover: '#e9e935',
            //rowSelected: '#e9e935',
            //rowSelectedHover: '#fafa3e',
            rowHover: '#fcfc6ab8',
            team: '#47ed47b2',
            teamOther: '#ed9547b2',
            latest0: '#86b5fe',
            latest1: '#86e7fe',
            latest2: '#e486fe',
            latest3: '#8ffe86'
        }
    }

    var $activeRow = undefined;
    var $activeTeam = undefined;

    var showRecentPreviouslyScheduledTeams = ($targetRow) => {
        const targetRowTeams = $targetRow.find('.team').map((ind,el) => {
            $(el).addClass(`latest-team latest-team-${ind}`);
            return $(el).attr('team');
        });
        console.log("toggling selected row", targetRowTeams);
        const prevAll = $targetRow.prevAll()
        const prevTeams = targetRowTeams.map((ind, el) => {
            const $prevTeam = prevAll.find(`[team=${el}]`).last();
            $prevTeam.addClass(`latest-team latest-team-${ind}`);
            return $prevTeam;
        })
        console.log(prevTeams);
    }
    var removeRecentPreviouslyScheduledTeams = () => {
        $('.latest-team').removeClass('latest-team-0');
        $('.latest-team').removeClass('latest-team-1');
        $('.latest-team').removeClass('latest-team-2');
        $('.latest-team').removeClass('latest-team-3');
        $('.latest-team').removeClass('latest-team');
    }

    var toggleSelectedRow = (target) => {
        console.log("Toggling row");
        console.log("clicking target", target);

        const targetRow = target.currentTarget;

        if (!!$activeRow) {
            var remove = false;
            if ($activeRow[0] === $(targetRow)[0]) {
                // remove the highlight when clicking the active row
                remove = true;
            }
            $activeRow.removeClass(rowSelectedClass);
            removeRecentPreviouslyScheduledTeams();
            $activeRow = undefined;
            if (remove) {
                return;
            }
        }

        //console.log("Row", targetRow);
        showRecentPreviouslyScheduledTeams($(targetRow))
        $activeRow = $(targetRow);
        $activeRow.addClass(rowSelectedClass);
    }

    var addSelectedTeamMatches = (team) => {
        if (!team) {
            return
        }
        const $teamOthers = $(`[team=${team}]:not('.team-selected')`);
        $teamOthers.addClass(teamSelectedOtherClass);
        console.log($teamOthers);
    }
    var clearSelectedTeamMatches = (team) => {
        if (!team) {
            return
        }
        const $teamOthers = $(`[team=${team}]`);
        $teamOthers.removeClass(teamSelectedOtherClass);
        console.log("clearing", $teamOthers);
    }

    var toggleSelectedTeam = (target) => { // Event
        //target.stopImmediatePropagation();
        //target.preventDefault();
        console.log("Toggling team", target);
        //console.log("team clicking target", target);

        const targetItem = target.target;
        const team = $(targetItem).attr('team');
        const activeTeam = $activeTeam?.attr('team');

        console.log("Toggling team", team);
        //console.log("Team", targetItem);

        if (!$(targetItem).hasClass('team')) {
            // clear the team when something that isn't a team is clicked

            clearSelectedTeamMatches(activeTeam);
            if (!!$activeTeam) {
                $activeTeam.removeClass(teamSelectedClass);
                $activeTeam = undefined;
            }

            return;
        }

        //console.log($activeTeam)
        //console.log($(targetItem));

        target.stopImmediatePropagation();

        if (!!$activeTeam) {
            var remove = false;
            if ($activeTeam[0] === $(targetItem)[0]) {
                // remove the highlight when clicking the active team
                remove = true;
                //target.stopPropagation();
            }
            $activeTeam.removeClass(teamSelectedClass);
            clearSelectedTeamMatches(activeTeam);
            $activeTeam = undefined;
            if (remove) {
                return
            }
        }

        $activeTeam = $(targetItem);
        $activeTeam.addClass(teamSelectedClass);
        addSelectedTeamMatches(team);

    }


    var createRowHighlightHandler = function () {
        console.log("### Creating row highlight handler");
        const $matchTableRowIds = $(matchTableRowId);
        $matchTableRowIds.bind('click', toggleSelectedRow);
        $matchTableRowIds.addClass(rowCustomStyleClass);

        GM_addStyle(`
${matchTableRowId}:focus,
${matchTableRowId}:hover {
  background-color: ${styles.highlights.rowHover} !important;
}

.${rowCustomStyleClass}.${rowSelectedClass} {
  background-color: ${styles.highlights.rowSelected} !important;
}
${matchTableRowId}.${rowCustomStyleClass}.${rowSelectedClass}:focus,
${matchTableRowId}.${rowCustomStyleClass}.${rowSelectedClass}:hover {
  background-color: ${styles.highlights.rowSelectedHover} !important;
}
.latest-team-0 {
  background-color: ${styles.highlights.latest0} !important;
}
.latest-team-1 {
  background-color: ${styles.highlights.latest1} !important;
}
.latest-team-2 {
  background-color: ${styles.highlights.latest2} !important;
}
.latest-team-3 {
  background-color: ${styles.highlights.latest3} !important;
}
`);
    };

    var addTeamNumberSelector = function() {
        console.log("### Adding team number to team entries");
        const $teamElements = $('.team');

        $teamElements.map((ind, el) => {
            const text = el.innerText;
            const team = text.replaceAll("*","").trim();
            $(el).addClass(`team-${team}`);
            $(el).attr('team',team);
            console.log(text, team);
        });

        console.log("### teams", $teamElements);
    }

    var createTeamHighlightHandler = function () {
        console.log("### Creating team highlight handler");
        console.log("Team already exists", $(`${matchTableRowId} .team`).length);
        if ($(`${matchTableRowId} .team`).length > 0) { // team already exists (cycle time report)
            $(red1CycleTimeSelector).addClass('red-1');
            $(red2CycleTimeSelector).addClass('red-2');
            $(blue1CycleTimeSelector).addClass('blue-1');
            $(blue2CycleTimeSelector).addClass('blue-2');
        } else {
            $(red1Selector).addClass('team red-1');
            $(red2Selector).addClass('team red-2');
            $(blue1Selector).addClass('team blue-1');
            $(blue2Selector).addClass('team blue-2');
        }

        addTeamNumberSelector();
        //$(`${matchTableRowId}`).bind('click', toggleSelectedTeam);
        $(`${matchTableRowId}`).click(toggleSelectedTeam);

        GM_addStyle(`
.team.team-selected {
  background-color: ${styles.highlights.team} !important;
}

.team.team-selected-other {
  background-color: ${styles.highlights.teamOther} !important;
}
`);
    };

    var waitForElement = function (selector, callback) {
        if ($(selector).length) {
            callback();
        } else {
            setTimeout(function () {
                waitForElement(selector, callback);
            }, 1000);
        }
    };

    waitForElement(pageLoadedIdentifier, function () {
        createTeamHighlightHandler();
        createRowHighlightHandler();
    });
})();
